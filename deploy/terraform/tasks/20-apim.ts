/**
 * Run this task to deploy Azure API Manager:
 * ts-node apim.ts
 *
 * This task assumes that the following resources are already created:
 *  - Resource group
 *  - Functions (app service)
 */
// tslint:disable:no-console
// tslint:disable:no-any

import apiManagementClient = require("azure-arm-apimanagement");
import webSiteManagementClient = require("azure-arm-website");
import * as path from "path";
import * as request from "request";
import * as config from "./../tfvars.json";
import { login } from "./login";

const CONFIGURATION_DIRECTORY_PATH = path.resolve(
  __dirname,
  "apim/api-management"
);
console.log(CONFIGURATION_DIRECTORY_PATH);

/**
 * Get Functions (app service) backend URL and master key
 * to set up API manager properties (backend).
 */
const getFunctionsInfo = async (webClient: webSiteManagementClient) => {
  const functions = await webClient.webApps.get(
    (config as any).azurerm_resource_group_00,
    (config as any).azurerm_functionapp_00
  );
  const creds = await webClient.webApps.listPublishingCredentials(
    (config as any).azurerm_resource_group_00,
    (config as any).azurerm_functionapp_00
  );
  const backendUrl = `https://${functions.defaultHostName}`;

  // @FIXME: unfortunately there are no API to get a Functions App master key
  const secretUrl = `https://${creds.publishingUserName}:${creds.publishingPassword}@${(config as any)
    .azurerm_functionapp_00}.scm.azurewebsites.net/api/functions/admin/masterkey`;
  const masterKey = await new Promise<string>((resolve, reject) =>
    request.get(secretUrl, (err, __, body) => {
      if (err) {
        return reject(err);
      }
      resolve(JSON.parse(body).masterKey);
    })
  );
  return { masterKey, backendUrl };
};

const setApimProperties = async (
  apiClient: apiManagementClient,
  properties: {
    readonly [s: string]: { readonly secret: boolean; readonly value: string };
  }
) => {
  return await Promise.all(
    Object.keys(properties).map(async prop => {
      return await apiClient.property.createOrUpdate(
        (config as any).azurerm_resource_group_00,
        (config as any).azurerm_apim_00,
        prop,
        {
          displayName: prop,
          name: prop,
          secret: properties[prop].secret,
          value: properties[prop].value
        }
      );
    })
  );
};

/**
 * Set up configuration, products, groups, policies, api, email templates, developer portal templates
 */
// const setupConfiguration = (apiClient: apiManagementClient) => {
//   //  -> get repository url
//   // apiClient.apiManagementService.get()
//   //  -> get repository creds (username and password)
//   //  -> push files to repo
//   //  -> distribute from master (flag: remove deleted products and subscriptions)
// };

export const run = async () => {
  const loginCreds = await login();

  // Needed to get storage connection string
  const apiClient = new apiManagementClient(
    (loginCreds as any).creds,
    loginCreds.subscriptionId
  );

  // Create
  const apiManagementService = await apiClient.apiManagementService.createOrUpdate(
    (config as any).azurerm_resource_group_00,
    (config as any).azurerm_apim_00,
    {
      location: (config as any).location,
      notificationSenderEmail: (config as any).azurerm_apim_email_00,
      publisherEmail: (config as any).azurerm_apim_email_00,
      publisherName: (config as any).azurerm_apim_publisher_00,
      sku: { name: (config as any).azurerm_apim_sku_00, capacity: 1 }
    }
  );
  console.log(apiManagementService.scmUrl);

  // Get functions (backend) info
  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );
  const { masterKey, backendUrl } = await getFunctionsInfo(webSiteClient);

  // Set backend url and code (master key) to access functions
  return await setApimProperties(apiClient, {
    backendUrl: { secret: false, value: backendUrl },
    code: { secret: true, value: masterKey }
  });

  // await setupConfiguration(apiClient, CONFIGURATION_DIRECTORY_PATH);
};

// configure logger + event hub:
//  https://docs.microsoft.com/it-it/azure/api-management/api-management-howto-log-event-hubs#create-an-api-management-logger
//  https://docs.microsoft.com/it-it/rest/api/apimanagement/Logger/CreateOrUpdate
//  or log analytics (or storage)

// users (user-groups) and subscriptions (user-products) must be migrated manually

run()
  .then(() => console.log("successfully deployed api manager"))
  .catch(console.error);
