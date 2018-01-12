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

import yargs = require("yargs");

import * as winston from "winston";
import { login } from "../../lib/login";

import webSiteManagementClient = require("azure-arm-website");

interface IRunParams {
  readonly resourceGroupName: string;
  readonly appServicePortalName: string;
  readonly appServicePortalGitBranch: string;
  readonly appServicePortalGitRepo: string;
}

export const run = async (config: IRunParams) => {
  if (!config.appServicePortalGitRepo) {
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
    branch: config.appServicePortalGitBranch,
    deploymentRollbackEnabled: true,
    // [#152115927] TODO: setting `isManualIntegration: false` will fail trying to send an email
    // to the service principal user. I guess this is a bug in the Azure APIs
    isManualIntegration: true,
    isMercurial: false,
    repoUrl: config.appServicePortalGitRepo,
    type: "GitHub"
  };

  winston.info(
    `Configuring Git integration for the Developer Portal application: ${
      config.appServicePortalGitRepo
    }#${config.appServicePortalGitBranch}`
  );

  // Create git integration
  return webSiteClient.webApps.createOrUpdateSourceControl(
    config.resourceGroupName,
    config.appServicePortalName,
    siteSourceControl
  );
};

const argv = yargs
  .alias("g", "resource-group-name")
  .demandOption("g")
  .string("g")
  .alias("n", "appservice-portal-name")
  .demandOption("n")
  .string("n")
  .alias("r", "git-repo")
  .demandOption("r")
  .string("r")
  .alias("b", "git-branch")
  .demandOption("b")
  .string("b").argv;

run({
  appServicePortalGitBranch: argv.b as string,
  appServicePortalGitRepo: argv.r as string,
  appServicePortalName: argv.n as string,
  resourceGroupName: argv.g as string
})
  .then(r => {
    if (r) {
      winston.info(
        "Successfully synced developer portal webapp with source control"
      );
    } else {
      winston.warn("Nothing happened");
    }
  })
  .catch((e: Error) => console.error(process.env.VERBOSE ? e : e.message));
