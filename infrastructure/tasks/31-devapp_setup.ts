/**
 * Run this task from the command line to set up Application Settings
 * for the developer portal facilities web application.
 *
 * yarn resources:devapp:setup
 *
 * https://github.com/teamdigitale/digital-citizenship-onboarding
 *
 * Two further steps are needed to complete the Web App deployment:
 *  - activate MSI for the application
 *  - register the application as "Contributor" into the API management IAM
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as winston from "winston";
import { login } from "../../lib/login";

import { IResourcesConfiguration, readConfig } from "../../lib/config";
import { checkEnvironment } from "../../lib/environment";

import webSiteManagementClient = require("azure-arm-website");

const CLIENT_ID = process.env.DEV_PORTAL_EXT_CLIENT_ID;
const CLIENT_SECRET = process.env.DEV_PORTAL_EXT_CLIENT_SECRET;
const ARM_SUBSCRIPTION_ID = process.env.ARM_SUBSCRIPTION_ID;
const TENANT_ID = process.env.ADB2C_TENANT_ID;

export const run = async (config: IResourcesConfiguration) => {
  const loginCreds = await login();

  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  const appSettings = await webSiteClient.webApps.listApplicationSettings(
    config.azurerm_resource_group,
    config.azurerm_app_service_portal
  );

  winston.info("Setup Developer Portal application settings");

  // Set up environment variables in application settings
  if (appSettings.properties) {
    return webSiteClient.webApps.updateApplicationSettings(
      config.azurerm_resource_group,
      config.azurerm_app_service_portal,
      {
        properties: {
          ...appSettings.properties,
          ARM_SUBSCRIPTION_ID,
          CLIENT_ID,
          CLIENT_SECRET,
          TENANT_ID
        }
      }
    );
  }

  return Promise.reject(new Error("Could not retrieve Application Settings"));
};

checkEnvironment()
  .then(() => readConfig(process.env.ENVIRONMENT))
  .then(run)
  .then(r => {
    if (r) {
      winston.info(
        "Successfully updated developer portal application settings"
      );
    }
  })
  .catch((e: Error) => console.error(process.env.VERBOSE ? e : e.message));
