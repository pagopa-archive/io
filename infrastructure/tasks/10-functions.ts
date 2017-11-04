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

import readConfig from "../../lib/config";
const config = readConfig(__dirname + "/../tfvars.json");

import storageManagementClient = require("azure-arm-storage");
import webSiteManagementClient = require("azure-arm-website");

import AppInsights = require("azure-arm-appinsights");
import CosmosDBManagementClient = require("azure-arm-cosmosdb");

const getAppServicePlan = async (client: any) => {
  return await client.appServicePlans.get(
    config.azurerm_resource_group,
    config.azurerm_app_service_plan
  );
};

const getAppInsightsKey = async (appInsightsClient: AppInsights) => {
  const appInsightsInstance = await appInsightsClient.components.get(
    config.azurerm_resource_group,
    config.azurerm_application_insights
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

  // Needed to get storage account connection string
  const storageClient = new storageManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );
  const storageAccountKeys = await storageClient.storageAccounts.listKeys(
    config.azurerm_resource_group,
    config.azurerm_functionapp_storage_account
  );
  if (!storageAccountKeys || !storageAccountKeys.keys) {
    throw new Error("Functions storage account keys not found");
  }
  // We finally got the storage account keys so we can build the connection string
  // @see StorageAccountListKeysResult
  const storageAccountMasterKey = storageAccountKeys.keys[0].value;
  const storageConnectionString =
    `DefaultEndpointsProtocol=https;AccountName=` +
    `${config.azurerm_functionapp_storage_account};AccountKey=${storageAccountMasterKey}`;

  // Get CosmosDB key and url
  const cosmosClient = new CosmosDBManagementClient(
    (loginCreds as any).creds,
    loginCreds.subscriptionId
  );
  const keys = await cosmosClient.databaseAccounts.listKeys(
    config.azurerm_resource_group,
    config.azurerm_cosmosdb
  );
  const cosmosdbKey = keys.primaryMasterKey;
  const cosmosdbLink = `https://${config.azurerm_cosmosdb}.documents.azure.com:443/`;

  // Create web app (functions)
  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );
  const servicePlan = await getAppServicePlan(webSiteClient);

  const appConfig = {
    kind: "functionapp",
    location: config.location,
    serverFarmId: servicePlan.id,
    siteConfig: {
      // We don't want the express server to idle,
      // so do not set `alwaysOn: false` in production
      alwaysOn: true,
      // You may want to set up an `apiDefinition.url` as well
      // to share OpenAPI specs with API manager
      appSettings: [
        // Mandatory parameters
        { name: "AzureWebJobsStorage", value: storageConnectionString },
        { name: "AzureWebJobsDashboard", value: storageConnectionString },
        // The following two have fixed values
        {
          name: "WEBSITE_NODE_DEFAULT_VERSION",
          value: config.functionapp_nodejs_version
        },
        { name: "FUNCTIONS_EXTENSION_VERSION", value: "~1" },
        // optional parameters
        {
          name: "COSMODB_NAME",
          value: config.azurerm_cosmosdb_documentdb
        },
        { name: "QueueStorageConnection", value: storageConnectionString },
        { name: "APPINSIGHTS_INSTRUMENTATIONKEY", value: appInsightsKey },
        // Avoid edit functions code from the Azure portal
        { name: "FUNCTION_APP_EDIT_MODE", value: "readonly" },
        // AzureWebJobsSecretStorageType may be `disabled` or `Blob`
        // When set to `Blob` the API manager task won't be able
        // to retrieve the master key
        { name: "AzureWebJobsSecretStorageType", value: "disabled" },
        { name: "WEBSITE_HTTPLOGGING_RETENTION_DAYS", value: "3" },
        {
          name: "MESSAGE_CONTAINER_NAME",
          value: config.message_blob_container
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
    config.azurerm_resource_group,
    config.azurerm_functionapp,
    appConfig
  );

  if (config.azurerm_functionapp_slot && createdFunction.id) {
    // Create slot for staging
    await webSiteClient.webApps.createOrUpdateSlot(
      config.azurerm_resource_group,
      config.azurerm_functionapp,
      appConfig,
      config.azurerm_functionapp_slot
    );

    // Create git integration for the staging slot
    if (config.functionapp_git_repo) {
      await webSiteClient.webApps.createOrUpdateSourceControlSlot(
        config.azurerm_resource_group,
        config.azurerm_functionapp,
        {
          branch: config.functionapp_git_branch,
          deploymentRollbackEnabled: true,
          // FIXME: setting `isManualIntegration: false` will fail trying to send an email
          // to the service principal user. I guess this is a bug in the Azure APIs
          isManualIntegration: true,
          isMercurial: false,
          repoUrl: config.functionapp_git_repo,
          type: config.functionapp_scm_type
        },
        config.azurerm_functionapp_slot
      );
    }
  }
};

run()
  .then(() => console.log("successfully deployed functions"))
  .catch(console.error);
