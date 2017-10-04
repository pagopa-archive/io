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

import * as config from "./../tfvars.json";
import { login } from "./login";

import apiManagementClient = require("azure-arm-apimanagement");
import webSiteManagementClient = require("azure-arm-website");
import * as request from "request";

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

  // @FIXME: unfortunately it looks there is no API to get a Functions App master key
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
  properties: { readonly [s: string]: string }
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
          secret: true,
          value: properties[prop]
        }
      );
    })
  );
};

export const run = async () => {
  const loginCreds = await login();

  // Needed to get storage connection string
  const apiClient = new apiManagementClient(
    (loginCreds as any).creds,
    loginCreds.subscriptionId
  );

  // Create
  await apiClient.apiManagementService.createOrUpdate(
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

  // Get functions (backend) info
  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  const { masterKey, backendUrl } = await getFunctionsInfo(webSiteClient);

  // console.log(masterKey);

  // Set backend url and code (master key) to access functions
  await setApimProperties(apiClient, {
    backendUrl,
    code: masterKey
  });
};

// Set up configuration, products, groups, policies, api, email templates, developer portal templates

//  -> get functions backend url and code
//  -> set properties (code + backendUrl)

//  -> get repository url
//  -> get repository creds (username and password)
//  -> push files to repo
//  -> distribute from master (flag: remove deleted products and subscriptions)

// configure logger + event hub:
//  https://docs.microsoft.com/it-it/azure/api-management/api-management-howto-log-event-hubs#create-an-api-management-logger
//  https://docs.microsoft.com/it-it/rest/api/apimanagement/Logger/CreateOrUpdate
//  or log analytics (or storage)

// users (user-groups) and subscriptions (user-products) must be migrated manually

run()
  .then(() => console.log("successfully deployed api manager"))
  .catch(console.error);