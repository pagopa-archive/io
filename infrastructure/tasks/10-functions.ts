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
 *  - AppInsights instance
 * 
 */
// tslint:disable:no-console
// tslint:disable:no-any

import { login } from "../../lib/login";
import * as config from "../tfvars.json";

import storageManagementClient = require("azure-arm-storage");
import webSiteManagementClient = require("azure-arm-website");

import AppInsights = require("azure-arm-appinsights");
import CosmosDBManagementClient = require("azure-arm-cosmosdb");

const getAppServicePlan = async (client: any) => {
  return await client.appServicePlans.get(
    (config as any).azurerm_resource_group,
    (config as any).azurerm_app_service_plan
  );
};

const getAppInsightsKey = async (appInsightsClient: AppInsights) => {
  const appInsightsInstance = await appInsightsClient.components.get(
    (config as any).azurerm_resource_group,
    (config as any).azurerm_application_insights
  );
  return appInsightsInstance.instrumentationKey;
};

export const run = async () => {
  const loginCreds = await login();

  // Get AppInsights instrumentation key
  const appInsightsClient = new AppInsights(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );
  const appInsightsKey = await getAppInsightsKey(appInsightsClient);

  // Needed to get storage connection string
  const storageClient = new storageManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );
  const storageAccountKeys = await storageClient.storageAccounts.listKeys(
    (config as any).azurerm_resource_group,
    (config as any).azurerm_storage_account
  );
  if (!storageAccountKeys || !storageAccountKeys.keys) {
    throw new Error("storageAccountKeys not found");
  }
  const storageConnectionString = `DefaultEndpointsProtocol=https;AccountName=${(config as any)
    .azurerm_storage_account};AccountKey=${storageAccountKeys.keys[0].value}`;

  // Get CosmosDB key and url
  const cosmosClient = new CosmosDBManagementClient(
    (loginCreds as any).creds,
    loginCreds.subscriptionId
  );
  const keys = await cosmosClient.databaseAccounts.listKeys(
    (config as any).azurerm_resource_group,
    (config as any).azurerm_cosmosdb
  );
  const cosmosdbKey = keys.primaryMasterKey;
  const cosmosdbLink = `https://${(config as any)
    .azurerm_cosmosdb}.documents.azure.com:443/`;

  // Create web app (functions)
  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );
  const servicePlan = await getAppServicePlan(webSiteClient);

  const appConfig = {
    kind: "functionapp",
    location: (config as any).location,
    serverFarmId: servicePlan.id,
    siteConfig: {
      alwaysOn: true,
      // nodeVersion:
      // apiDefinition.url
      appSettings: [
        // mandatory params
        { name: "AzureWebJobsStorage", value: storageConnectionString },
        { name: "AzureWebJobsDashboard", value: storageConnectionString },
        { name: "WEBSITE_NODE_DEFAULT_VERSION", value: "6.5.0" },
        { name: "FUNCTIONS_EXTENSION_VERSION", value: "~1" },
        // optional params
        {
          name: "COSMODB_NAME",
          value: (config as any).azurerm_cosmosdb_documentdb
        },
        { name: "QueueStorageConnection", value: storageConnectionString },
        { name: "APPINSIGHTS_INSTRUMENTATIONKEY", value: appInsightsKey },
        { name: "FUNCTION_APP_EDIT_MODE", value: "readonly" },
        { name: "AzureWebJobsSecretStorageType", value: "disabled" },
        { name: "WEBSITE_HTTPLOGGING_RETENTION_DAYS", value: "3" },
        {
          name: "MESSAGE_CONTAINER_NAME",
          value: (config as any).message_blob_container
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
  };

  const createdFunction = await webSiteClient.webApps.createOrUpdate(
    (config as any).azurerm_resource_group,
    (config as any).azurerm_functionapp,
    appConfig
  );

  if ((config as any).azurerm_functionapp_slot && createdFunction.id) {
    // Create slot for staging
    await webSiteClient.webApps.createOrUpdateSlot(
      (config as any).azurerm_resource_group,
      (config as any).azurerm_functionapp,
      appConfig,
      (config as any).azurerm_functionapp_slot
    );

    // Create git integration for the staging slot
    if ((config as any).functionapp_git_repo) {
      await webSiteClient.webApps.createOrUpdateSourceControlSlot(
        (config as any).azurerm_resource_group,
        (config as any).azurerm_functionapp,
        {
          branch: (config as any).functionapp_git_branch,
          deploymentRollbackEnabled: true,
          // FIXME: `isManualIntegration: false` will fail trying to send an email
          // to the service principal user. I guess this is a bug in the Azure APIs
          isManualIntegration: true,
          isMercurial: false,
          repoUrl: (config as any).functionapp_git_repo,
          type: (config as any).functionapp_scm_type
        },
        (config as any).azurerm_functionapp_slot
      );
    }
  }
};

run()
  .then(() => console.log("successfully deployed functions"))
  .catch(console.error);
