/**
 * Run this task to deploy Azure Functions:
 *
 * yarn resources:functions:setup
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

import * as winston from "winston";
import { login } from "../../lib/login";

import { IResourcesConfiguration, readConfig } from "../../lib/config";
import { checkEnvironment } from "../../lib/environment";

import storageManagementClient = require("azure-arm-storage");
import webSiteManagementClient = require("azure-arm-website");

import AppInsights = require("azure-arm-appinsights");
import CosmosDBManagementClient = require("azure-arm-cosmosdb");

const getAppServicePlan = async (
  client: any,
  config: IResourcesConfiguration
) => {
  return await client.appServicePlans.get(
    config.azurerm_resource_group,
    config.azurerm_app_service_plan
  );
};

const getAppInsightsKey = async (
  appInsightsClient: AppInsights,
  config: IResourcesConfiguration
) => {
  const appInsightsInstance = await appInsightsClient.components.get(
    config.azurerm_resource_group,
    config.azurerm_application_insights
  );
  return appInsightsInstance.instrumentationKey;
};

export const run = async (config: IResourcesConfiguration) => {
  const loginCreds = await login();

  winston.info("Get AppInsights key to populate Functions settings");

  // Get AppInsights instrumentation key
  const appInsightsClient = new AppInsights(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );
  const appInsightsKey = await getAppInsightsKey(appInsightsClient, config);

  winston.info(
    "Get Storage account (Functions) connection string to populate Functions settings"
  );

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
    `${config.azurerm_functionapp_storage_account};AccountKey=${
      storageAccountMasterKey
    };EndpointSuffix=core.windows.net`;

  winston.info(
    "Get Storage account (Queues, Blob) connection string to populate Functions settings"
  );

  // Functions storage account and Queues storage account differs
  const queueStorageAccountKeys = await storageClient.storageAccounts.listKeys(
    config.azurerm_resource_group,
    config.azurerm_storage_account
  );
  if (!queueStorageAccountKeys || !queueStorageAccountKeys.keys) {
    throw new Error("Queues storage account keys not found");
  }
  // We finally got the storage account keys so we can build the connection string
  // @see StorageAccountListKeysResult
  const queueStorageAccountMasterKey = queueStorageAccountKeys.keys[0].value;
  const queueStorageConnectionString =
    `DefaultEndpointsProtocol=https;AccountName=` +
    `${config.azurerm_storage_account};AccountKey=${
      queueStorageAccountMasterKey
    };EndpointSuffix=core.windows.net`;

  winston.info("Get CosmosDB connection string to populate Functions settings");

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
  const cosmosdbLink = `https://${
    config.azurerm_cosmosdb
  }.documents.azure.com:443/`;

  winston.info("Create Function APP Service Plan");

  // Create web app (functions)
  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );
  const servicePlan = await getAppServicePlan(webSiteClient, config);

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
          name: "COSMOSDB_NAME",
          value: config.azurerm_cosmosdb_documentdb
        },
        { name: "QueueStorageConnection", value: queueStorageConnectionString },
        { name: "APPINSIGHTS_INSTRUMENTATIONKEY", value: appInsightsKey },
        // Avoid edit functions code from the Azure portal
        { name: "FUNCTION_APP_EDIT_MODE", value: "readonly" },
        // AzureWebJobsSecretStorageType may be `disabled` or `Blob`
        // When set to `Blob` the API manager task won't be able
        // to retrieve the master key
        { name: "AzureWebJobsSecretStorageType", value: "disabled" },
        { name: "WEBSITE_HTTPLOGGING_RETENTION_DAYS", value: "3" },
        { name: "SCM_USE_FUNCPACK_BUILD", value: "1" },
        {
          name: "MESSAGE_CONTAINER_NAME",
          value: config.message_blob_container
        }
      ],
      connectionStrings: [
        {
          // [#152800384] - TODO: change the following value
          // when we'll migrate to production service
          connectionString: process.env.SENDGRID_KEY,
          name: "SENDGRID_KEY",
          type: "Custom"
        },
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

  winston.info("Create Function production slot");

  // Create production slot
  const createdFunction = await webSiteClient.webApps.createOrUpdate(
    config.azurerm_resource_group,
    config.azurerm_functionapp,
    appConfig
  );

  winston.info("Create Function staging slot");

  // Create staging slot
  if (config.azurerm_functionapp_slot && createdFunction.id) {
    await webSiteClient.webApps.createOrUpdateSlot(
      config.azurerm_resource_group,
      config.azurerm_functionapp,
      appConfig,
      config.azurerm_functionapp_slot
    );
  }

  const siteSourceControl = {
    branch: config.functionapp_git_branch,
    deploymentRollbackEnabled: true,
    // [#152115927] TODO: setting `isManualIntegration: false` will fail trying to send an email
    // to the service principal user. I guess this is a bug in the Azure APIs
    isManualIntegration: true,
    isMercurial: false,
    repoUrl: config.functionapp_git_repo,
    type: config.functionapp_scm_type
  };

  winston.info("Setup Git integration for Function staging slot");

  // Create git integration for the staging slot
  if (config.azurerm_functionapp_slot && config.functionapp_git_repo) {
    await webSiteClient.webApps.createOrUpdateSourceControlSlot(
      config.azurerm_resource_group,
      config.azurerm_functionapp,
      siteSourceControl,
      config.azurerm_functionapp_slot
    );
  }

  winston.info("Setup Git integration for Function production slot");

  // Create git integration for the production slot
  if (createdFunction.id && config.functionapp_git_repo) {
    await webSiteClient.webApps.createOrUpdateSourceControl(
      config.azurerm_resource_group,
      config.azurerm_functionapp,
      siteSourceControl
    );
  }
};

checkEnvironment()
  .then(() => readConfig(process.env.ENVIRONMENT))
  .then(run)
  .then(() => winston.info("Successfully deployed Functions app"))
  .catch((e: Error) => console.error(process.env.VERBOSE ? e : e.message));
