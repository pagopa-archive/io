/**
 * This task deploys Azure API Management logger.
 *
 * This task assumes that the following resources are already created:
 *  - Resource group
 *  - Functions (app service)
 *  - API management resource
 *  - EventHub
 *
 * Unfortunately you cannot migrate Widgets and Media Libray:
 * https://{publisherPortalName}.portal.azure-api.net/Admin/Widgets
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as t from "io-ts";
import * as path from "path";
import * as winston from "winston";

import apiManagementClient from "azure-arm-apimanagement";
import yargs = require("yargs");

import { left } from "fp-ts/lib/Either";
import { reporter } from "io-ts-reporters";
import { checkEnvironment } from "../../lib/environment";
import { login } from "../../lib/login";

import {
  CONF_DIR,
  getObjectFromJson,
  readConfig,
  ResourcesConfiguration
} from "../../lib/config";

/**
 * ApiParams contains the variables taken from command line (provisioner arguments)
 * that represents values that *change* between different deploying environments.
 */
const ApimParams = t.interface({
  apim_configuration_path: t.string,
  azurerm_apim: t.string,
  azurerm_apim_eventhub: t.string,
  azurerm_apim_eventhub_connstr: t.string,
  azurerm_resource_group: t.string,
  environment: t.string
});

type ApimParams = t.TypeOf<typeof ApimParams>;

const setupLogger = async (
  apiClient: apiManagementClient,
  config: ResourcesConfiguration,
  params: ApimParams
) => {
  winston.info("Create an EventHub logger for the API management");
  return apiClient.logger.createOrUpdate(
    params.azurerm_resource_group,
    params.azurerm_apim,
    config.apim_logger_id,
    {
      credentials: {
        connectionString: params.azurerm_apim_eventhub_connstr,
        name: params.azurerm_apim_eventhub
      },
      description: "API management EventHub logger",
      loggerType: "azureEventHub"
      // We have to cast to any here because of a bug in Azure ARM EventHub API:
      // when you update (PUT) the EventHub logger you MUST provide the loggerType
    } as any
  );
};

export const run = async (params: ApimParams) => {
  const config = readConfig(
    params.environment,
    path.join(...CONF_DIR, ...params.apim_configuration_path.split("/"))
  ).getOrElseL(errs => {
    throw new Error(
      "Error parsing configuration:\n\n" + reporter(left(errs) as any)
    );
  });

  const loginCreds = await login();

  const apiClient = new apiManagementClient(
    loginCreds.creds,
    loginCreds.subscriptionId
  );

  // Set up EventHub logging
  await setupLogger(apiClient, config, params);
};

const argv = yargs
  .option("environment", {
    demandOption: true,
    string: true
  })
  .option("azurerm_resource_group", {
    string: true
  })
  .option("azurerm_apim", {
    string: true
  })
  .option("azurerm_apim_eventhub", {
    string: true
  })
  .option("apim_configuration_path", {
    string: true
  })
  .option("azurerm_apim_eventhub_connstr", {
    string: true
  })
  .help().argv;

checkEnvironment()
  .then(() => getObjectFromJson(ApimParams, argv))
  .then(e =>
    e.map(run).mapLeft(err => {
      throw err;
    })
  )
  .then(() => winston.info("Completed"))
  .catch((e: Error) => winston.error(e.message));
