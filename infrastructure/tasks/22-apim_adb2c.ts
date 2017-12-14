/**
 * Run this task from the command line to configure Active Directory B2C
 * authentication for the API Manager developer portal.
 *
 * yarn resources:apim:adb2c
 *
 * API users must sign-in / sign-up through ADB2C.
 *
 * This task assumes that the following resources are already configured:
 *  - Resource group
 *  - Active Directory B2C
 *  - API management resource
 *
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as winston from "winston";
import { login } from "../../lib/login";

import { IResourcesConfiguration, readConfig } from "../../lib/config";
import { checkEnvironment } from "../../lib/environment";

import apiManagementClient = require("azure-arm-apimanagement");

const adb2cClientId = process.env.DEV_PORTAL_CLIENT_ID;
const adb2cClientSecret = process.env.DEV_PORTAL_CLIENT_SECRET;
const adb2cTenantId = process.env.ADB2C_TENANT_ID;

export const run = async (config: IResourcesConfiguration) => {
  const loginCreds = await login();

  const apiClient = new apiManagementClient(
    (loginCreds as any).creds,
    loginCreds.subscriptionId
  );

  winston.info(
    "Enable API management sign-up / sign-in through the Active Directory B2C tenant"
  );

  return apiClient.identityProvider.createOrUpdate(
    config.azurerm_resource_group,
    config.azurerm_apim,
    "aadB2C",
    {
      allowedTenants: [adb2cTenantId],
      clientId: adb2cClientId,
      clientSecret: adb2cClientSecret,
      identityProviderContractType: "aadB2C",
      signinPolicyName: config.azurerm_adb2c_policy,
      signupPolicyName: config.azurerm_adb2c_policy
    }
  );
};

checkEnvironment()
  .then(() => readConfig(process.env.ENVIRONMENT))
  .then(run)
  .then(() =>
    winston.info("Successfully linked API management to ADB2C tenant")
  )
  .catch((e: Error) => console.error(process.env.VERBOSE ? e : e.message));
