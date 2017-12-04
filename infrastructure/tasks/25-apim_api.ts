/**
 * Run this task from the command line to sync the API Manager APIs
 * from the OpenAPI specs (operations) exposed by Functions.
 * 
 * yarn resources:apim:api
 *
 * In this way the API management can let HTTP requests pass through
 * when they match the synched API operations. Otherwise it will 
 * return "404 not found" for every request.
 * 
 * This task lets you synchronize API operations, products and policies
 * without the need to push the whole local git repository which
 * contains the API management configuration (ie. site templates).
 * 
 * By default only API operations are synched.
 * To sync policies and products as well set the following environment variables:
 * INCLUDE_API_PRODUCTS=1 INCLUDE_API_POLICIES=1
 *
 * This task assumes that the following resources are already created:
 *  - Resource group
 *  - Functions (app service)
 *  - API management resource
 *
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as winston from "winston";
import { login } from "../../lib/login";

import { IResourcesConfiguration, readConfig } from "../../lib/config";
import { checkEnvironment } from "../../lib/environment";

import { getFunctionsInfo } from "../../lib/task_utils";

import apiManagementClient = require("azure-arm-apimanagement");
import webSiteManagementClient = require("azure-arm-website");

import * as fs from "fs";
import * as path from "path";

// While it's usually safe to programmatically sync the API *operations*
// retrieved from the Functions OpenAPI endpoint(s) to the API management ones,
// it's far less safe to add API to products or/and to modify API policies: these tasks are commonly run
// using the Azure portal interface (web UI), so the risk of overriding already modified settings is high.
// For this reason we provide a default behavior for this task (sync only API operations)
// and opt-in environment variables to allow synching API products and policies.
const INCLUDE_API_PRODUCTS = process.env.INCLUDE_API_PRODUCTS;
const INCLUDE_API_POLICIES = process.env.INCLUDE_API_POLICIES;

export const run = async (config: IResourcesConfiguration) => {
  const loginCreds = await login();

  const apiClient = new apiManagementClient(
    (loginCreds as any).creds,
    loginCreds.subscriptionId
  );

  winston.info("Get OpenAPI specs path and code (masterKey) from Functions");

  // Get OpenAPI specs path and code (masterKey) from Functions
  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  const { masterKey, backendUrl } = await getFunctionsInfo(
    config,
    webSiteClient
  );

  return Promise.all(
    config.apim_apis.map(async apiEntry => {
      const contentValue = `${backendUrl}${apiEntry.api
        .specsPath}?code=${masterKey}`;

      winston.info(
        `Adding API from URL: ${backendUrl}${apiEntry.api.specsPath}`
      );

      // Add API to API management
      await apiClient.api.createOrUpdate(
        config.azurerm_resource_group,
        config.azurerm_apim,
        apiEntry.id,
        {
          contentFormat: "swagger-link-json",
          contentValue,
          displayName: apiEntry.api.displayName,
          path: apiEntry.api.path,
          protocols: ["https"],
          // WARNING: serviceUrl is taken from the swagger specs "host" field
          // and there's no way to override that value here: it *must* be changed
          // manually in the API management settings
          // (or provide a real value in the swagger specs).
          serviceUrl: backendUrl
        }
      );
      // Add API to products
      if (INCLUDE_API_PRODUCTS) {
        await Promise.all(
          apiEntry.products.map(async product => {
            winston.info(
              `Import API product into the API management: ${product}`
            );
            return apiClient.productApi.createOrUpdate(
              config.azurerm_resource_group,
              config.azurerm_apim,
              product,
              apiEntry.id
            );
          })
        );
      }
      // Add a policy to the API reading it from a file
      if (INCLUDE_API_POLICIES && apiEntry.policyFile) {
        winston.info(
          `Import API policy into the API management: ${apiEntry.policyFile}`
        );
        const policyContent = fs.readFileSync(
          path.join(__dirname, "..", "api-policies", apiEntry.policyFile),
          "utf8"
        );
        await apiClient.apiPolicy.createOrUpdate(
          config.azurerm_resource_group,
          config.azurerm_apim,
          apiEntry.id,
          {
            policyContent
          },
          // If-Match: *
          "*"
        );
      }
    })
  );
};

checkEnvironment()
  .then(() => readConfig(process.env.ENVIRONMENT))
  .then(run)
  .then(() => winston.info("Successfully synched APIs to API management"))
  .catch((e: Error) => console.error(process.env.VERBOSE ? e : e.message));
