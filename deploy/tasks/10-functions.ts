/**
 * Run this task to deploy Azure Functions:
 * ts-node functions.ts
 * 
 * This task assumes that the following resources are already created:
 *  - Resource group
 *  - CosmoDB database
 *  - App service plan
 *  - Storage account
 *  - Storage Blob container
 * 
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as config from "./../tfvars.json";
import { login } from "./login";

import storageManagementClient = require("azure-arm-storage");
import webSiteManagementClient = require("azure-arm-website");

import CosmosDBManagementClient = require("azure-arm-cosmosdb");

const getAppServicePlan = async (client: any) => {
  return await client.appServicePlans.get(
    (config as any).azurerm_resource_group_00,
    (config as any).azurerm_app_service_plan_00
  );
};

export const run = async () => {
  const loginCreds = await login();

  // Needed to get storage connection string
  const storageClient = new storageManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );
  const storageAccountKeys = await storageClient.storageAccounts.listKeys(
    (config as any).azurerm_resource_group_00,
    (config as any).azurerm_storage_account_00
  );
  if (!storageAccountKeys || !storageAccountKeys.keys) {
    throw new Error("storageAccountKeys not found");
  }
  const storageConnectionString = `DefaultEndpointsProtocol=https;AccountName=${(config as any)
    .azurerm_storage_account_00};AccountKey=${storageAccountKeys.keys[0]
    .value}`;

  // Get CosmosDB key and url
  const cosmosClient = new CosmosDBManagementClient(
    (loginCreds as any).creds,
    loginCreds.subscriptionId
  );
  const keys = await cosmosClient.databaseAccounts.listKeys(
    (config as any).azurerm_resource_group_00,
    (config as any).azurerm_cosmosdb_00
  );
  const cosmosdbKey = keys.primaryMasterKey;
  const cosmosdbLink = `https://${(config as any)
    .azurerm_cosmosdb_00}.documents.azure.com:443/`;

  // Create web app (functions)
  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );
  const servicePlan = await getAppServicePlan(webSiteClient);

  return webSiteClient.webApps.createOrUpdate(
    (config as any).azurerm_resource_group_00,
    (config as any).azurerm_functionapp_00,
    {
      kind: "functionapp",
      location: (config as any).location,
      serverFarmId: servicePlan.id,
      siteConfig: {
        alwaysOn: false,
        // nodeVersion:
        // apiDefinition.url
        // scmType:
        appSettings: [
          // mandatory params
          { name: "AzureWebJobsStorage", value: storageConnectionString },
          { name: "AzureWebJobsDashboard", value: storageConnectionString },
          { name: "WEBSITE_NODE_DEFAULT_VERSION", value: "6.5.0" },
          { name: "FUNCTIONS_EXTENSION_VERSION", value: "~1" },
          // optional params
          {
            name: "COSMODB_NAME",
            value: (config as any).azurerm_cosmosdb_documentdb_00
          },
          { name: "QueueStorageConnection", value: storageConnectionString },
          { name: "APPINSIGHTS_INSTRUMENTATIONKEY", value: "" },
          { name: "FUNCTION_APP_EDIT_MODE", value: "readonly" },
          { name: "AzureWebJobsSecretStorageType", value: "disabled" },
          { name: "WEBSITE_HTTPLOGGING_RETENTION_DAYS", value: "3" },
          {
            name: "MESSAGE_CONTAINER_NAME",
            value: (config as any).message_blob_container_00
          }
        ],
        connectionStrings: [
          {
            connectionString: cosmosdbLink,
            name: "COSMOSDB_URI",
            type: "Custom"
          },
          {
            connectionString: cosmosdbKey,
            name: "COSMOSDB_KEY",
            type: "Custom"
          }
        ]
      }
    }
  );
};

run()
  .then(() => console.log("successfully deployed functions"))
  .catch(console.error);
