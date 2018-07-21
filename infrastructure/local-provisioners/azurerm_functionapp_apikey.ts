/**
 * Run this task from the command line set the API-Key
 * (Ocp-Apim-Subscription-Key) for the Api managament
 * administration account into the Functions settings
 *
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as t from "io-ts";
import * as path from "path";
import * as winston from "winston";

import yargs = require("yargs");

import { ICreds, login } from "../../lib/login";

import { checkEnvironment } from "../../lib/environment";

import { getExistingUser, userIdToSubscriptionId } from "../../lib/apim_user";

import apiManagementClient from "azure-arm-apimanagement";
import webSiteManagementClient = require("azure-arm-website");

import { left } from "fp-ts/lib/Either";
import { reporter } from "io-ts-reporters";
import {
  CONF_DIR,
  getObjectFromJson,
  readConfig,
  ResourcesConfiguration
} from "../../lib/config";

const TaskParams = t.interface({
  apim_configuration_path: t.string,
  azurerm_apim: t.string,
  azurerm_functionapp: t.string,
  azurerm_resource_group: t.string,
  environment: t.string
});

type TaskParams = t.TypeOf<typeof TaskParams>;

const getApimUserSubscriptionKey = async (
  config: ResourcesConfiguration,
  params: TaskParams,
  loginCreds: ICreds
): Promise<string> => {
  const apiClient = new apiManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  const user = await getExistingUser(
    apiClient,
    config.apim_admin_oid,
    params.azurerm_resource_group,
    params.azurerm_apim
  );

  if (!user || !user.name) {
    throw new Error("Cannot get APIm user key");
  }

  const subscriptionId = userIdToSubscriptionId(
    user.name,
    config.apim_admin_product
  );

  const subscription = await apiClient.subscription.get(
    params.azurerm_resource_group,
    params.azurerm_apim,
    subscriptionId
  );

  return subscription.primaryKey;
};

export const run = async (params: TaskParams) => {
  const config = readConfig(
    params.environment,
    path.join(...CONF_DIR, ...params.apim_configuration_path.split("/"))
  ).getOrElseL(errs => {
    throw new Error(
      "Error parsing configuration:\n\n" + reporter(left(errs) as any)
    );
  });
  const loginCreds = await login();

  const subscriptionKey = await getApimUserSubscriptionKey(
    config,
    params,
    loginCreds
  );

  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  const appSettings = await webSiteClient.webApps.listApplicationSettings(
    params.azurerm_resource_group,
    params.azurerm_functionapp
  );

  // Set up PUBLIC_API_KEY variable in application settings
  if (appSettings.properties && subscriptionKey) {
    winston.info("Setup the user API Key into Functions application settings");
    await webSiteClient.webApps.updateApplicationSettings(
      params.azurerm_resource_group,
      params.azurerm_functionapp,
      {
        properties: {
          ...appSettings.properties,
          PUBLIC_API_KEY: subscriptionKey
        }
      }
    );
  }
};

const argv = yargs
  .option("environment", {
    string: true
  })
  .option("azurerm_resource_group", {
    string: true
  })
  .option("azurerm_apim", {
    string: true
  })
  .option("apim_configuration_path", {
    string: true
  })
  .option("azurerm_functionapp", {
    string: true
  })
  .help().argv;

checkEnvironment()
  .then(() => getObjectFromJson(TaskParams, argv))
  .then(e =>
    e.map(run).mapLeft(err => {
      throw err;
    })
  )
  .then(() => winston.info("Completed"))
  .catch((e: Error) => winston.error(e.message));
