/**
 * Run this task from the command line to set up deployment
 * from the GitHub repository to the Azure App Service
 * running the developer portal onboarding facilities:
 *
 * yarn resources:devapp:git
 *
 * https://github.com/teamdigitale/digital-citizenship-onboarding
 *
 * This task assumes that the following resources are already created:
 *  - Resource group
 *  - App Service Plan
 *  - App Service
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as winston from "winston";
import { login } from "../../lib/login";

import { IResourcesConfiguration, readConfig } from "../../lib/config";
import { checkEnvironment } from "../../lib/environment";

import webSiteManagementClient = require("azure-arm-website");

export const run = async (config: IResourcesConfiguration) => {
  if (!config.app_service_portal_git_repo) {
    return Promise.reject(
      "Deployment from source control repository not configured, skipping."
    );
  }
  const loginCreds = await login();

  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  const siteSourceControl = {
    branch: config.app_service_portal_git_branch,
    deploymentRollbackEnabled: true,
    // [#152115927] TODO: setting `isManualIntegration: false` will fail trying to send an email
    // to the service principal user. I guess this is a bug in the Azure APIs
    isManualIntegration: true,
    isMercurial: false,
    repoUrl: config.app_service_portal_git_repo,
    type: config.app_service_portal_scm_type
  };

  winston.info("Setup Git integration for the Developer Portal application");

  // Create git integration
  return webSiteClient.webApps.createOrUpdateSourceControl(
    config.azurerm_resource_group,
    config.azurerm_app_service_portal,
    siteSourceControl
  );
};

checkEnvironment()
  .then(() => readConfig(process.env.ENVIRONMENT))
  .then(run)
  .then(r => {
    if (r) {
      winston.info(
        "Successfully synced developer portal webapp with source control"
      );
    }
  })
  .catch((e: Error) => console.error(process.env.VERBOSE ? e : e.message));
