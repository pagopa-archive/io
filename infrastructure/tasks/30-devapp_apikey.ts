/**
 * Run this task from the command line to create
 * a new API management user that has the rights to 
 * create a new Service (through Admin API) and to send
 * a new Message (through Digital Citizenship API).
 *
 * yarn resources:devapp:apikey
 *
 * 
 * This lets the developer portal facilities web application
 * create or update API gateway users.
 *
 * https://github.com/teamdigitale/digital-citizenship-onboarding
 *
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as winston from "winston";
import { ICreds, login } from "../../lib/login";

import { IResourcesConfiguration, readConfig } from "../../lib/config";
import { checkEnvironment } from "../../lib/environment";

import { IUserData, updateApimUser } from "../../lib/apim_user";
import { createOrUpdateService, getServiceModel } from "../../lib/service";

import apiManagementClient = require("azure-arm-apimanagement");
import webSiteManagementClient = require("azure-arm-website");

import CosmosDBManagementClient = require("azure-arm-cosmosdb");

const createOrUpdareAdminApiUser = async (
  config: IResourcesConfiguration,
  loginCreds: ICreds
) => {
  const userData: IUserData = {
    email: config.apim_admin_email,
    firstName: config.apim_admin_firstname,
    groups: config.apim_admin_groups,
    lastName: config.apim_admin_lastname,
    oid: config.apim_admin_oid,
    productName: config.apim_admin_product
  };

  const apiClient = new apiManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  winston.info(
    "Create or update an API management user for the Developer Portal application"
  );

  // Create or update user in API management
  const user = await apiClient.user.createOrUpdate(
    config.azurerm_resource_group,
    config.azurerm_apim,
    userData.oid,
    {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName
    }
  );

  if (!user || !user.name) {
    throw new Error("Cannot create new user");
  }

  winston.info("Subscribe the user to the APIs (products) and assign Groups");

  // Add user to product in API management
  const subscription = await updateApimUser(
    user.name,
    userData,
    apiClient,
    config
  );

  if (!subscription || !subscription.name) {
    throw new Error("Cannot create subscription");
  }

  winston.info("Get CosmosDB credentials to create a Service for the user");

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

  winston.info(`Using CosmosDB url ${cosmosdbLink}`);

  if (undefined === cosmosdbKey) {
    throw new Error("Cannot get CosmosDB key");
  }

  // Create serviceModel in order to reuse CRUD methods
  // to upsert Service data
  const serviceModel = getServiceModel(
    cosmosdbLink,
    cosmosdbKey,
    config.azurerm_cosmosdb_documentdb
  );
  const serviceId = subscription.name;

  winston.info("Create a Service for the Developer Portal application user");

  // Save a service related to the user subscription.
  // We cannot use the APIs at https://${config.azurerm_apim}.azure-api.net
  // because to do that we need an associated Service
  // *before* the actual call to the APIs
  await createOrUpdateService(
    serviceId,
    {
      authorized_cidrs: [],
      authorized_recipients: [],
      department_name: "IT",
      organization_name: "AgID",
      service_id: serviceId,
      service_name: "Digital Citizenship"
    },
    serviceModel
  );

  return subscription;
};

export const run = async (config: IResourcesConfiguration) => {
  const loginCreds = await login();

  const subscription = await createOrUpdareAdminApiUser(config, loginCreds);

  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  const appSettings = await webSiteClient.webApps.listApplicationSettings(
    config.azurerm_resource_group,
    config.azurerm_app_service_portal
  );

  winston.info(
    "Setup the user API Key into the Developer Portal application settings"
  );

  // Set up ADMIN_API_KEY variable in application settings
  if (appSettings.properties) {
    await webSiteClient.webApps.updateApplicationSettings(
      config.azurerm_resource_group,
      config.azurerm_app_service_portal,
      {
        properties: {
          ...appSettings.properties,
          ADMIN_API_KEY: subscription.primaryKey
        }
      }
    );
  }
};

checkEnvironment()
  .then(() => readConfig(process.env.ENVIRONMENT))
  .then(run)
  .then(() =>
    winston.info("Successfully set up developer portal ADMIN_API_KEY")
  )
  .catch((e: Error) => console.error(process.env.VERBOSE ? e : e.message));
