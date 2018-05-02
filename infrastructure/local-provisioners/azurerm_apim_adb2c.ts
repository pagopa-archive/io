/**
 * This task setup Active Directory B2C authentication
 * in the Azure API Management developer portal.
 *
 * This task assumes that the following resources are already created:
 *  - Resource group
 *  - Functions (app service)
 *  - ADB2C directory
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

const ApimParams = t.interface({
  adb2c_portal_client_id: t.string,
  adb2c_portal_client_secret: t.string,
  adb2c_tenant_id: t.string,
  apim_configuration_path: t.string,
  azurerm_apim: t.string,
  azurerm_resource_group: t.string,
  environment: t.string
});

type ApimParams = t.TypeOf<typeof ApimParams>;

/**
 * Setup ADB2C authentication for developer portal users.
 */
const setupAdb2c = (
  apiClient: apiManagementClient,
  config: ResourcesConfiguration,
  params: ApimParams
) => {
  return apiClient.identityProvider.createOrUpdate(
    params.azurerm_resource_group,
    params.azurerm_apim,
    "aadB2C",
    {
      allowedTenants: [params.adb2c_tenant_id],
      clientId: params.adb2c_portal_client_id,
      clientSecret: params.adb2c_portal_client_secret,
      identityProviderContractType: "aadB2C",
      signinPolicyName: config.azurerm_adb2c_policy,
      signupPolicyName: config.azurerm_adb2c_policy
    }
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

  // Allow access to developer portal through ADB2C
  await setupAdb2c(apiClient, config, params);
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
  .option("apim_configuration_path", {
    string: true
  })
  .option("adb2c_tenant_id", {
    string: true
  })
  .option("adb2c_portal_client_id", {
    string: true
  })
  .option("adb2c_portal_client_secret", {
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
