/**
 * Run this task from the command line to set up deployment
 * from the GitHub repository to an Azure App
 */
// tslint:disable:no-console
// tslint:disable:no-any

import yargs = require("yargs");

import * as winston from "winston";
import { login } from "../../lib/login";

import webSiteManagementClient = require("azure-arm-website");

interface IRunParams {
  readonly resourceGroupName: string;
  readonly appName: string;
  readonly appGitBranch: string;
  readonly appGitRepo: string;
}

export const run = async (params: IRunParams) => {
  if (!params.appGitRepo) {
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
    branch: params.appGitBranch,
    deploymentRollbackEnabled: true,
    // [#152115927] TODO: setting `isManualIntegration: false` will fail trying to send an email
    // to the service principal user. I guess this is a bug in the Azure APIs
    isManualIntegration: true,
    isMercurial: false,
    repoUrl: params.appGitRepo,
    type: "GitHub"
  };

  winston.info(
    `Configuring Git integration for the application: ${params.appGitRepo}#${
      params.appGitBranch
    }`
  );

  // Create git integration
  return webSiteClient.webApps.createOrUpdateSourceControl(
    params.resourceGroupName,
    params.appName,
    siteSourceControl
  );
};

const argv = yargs
  .alias("g", "resource-group-name")
  .demandOption("g")
  .string("g")
  .alias("n", "app-name")
  .demandOption("n")
  .string("n")
  .alias("r", "git-repo")
  .demandOption("r")
  .string("r")
  .alias("b", "git-branch")
  .demandOption("b")
  .string("b").argv;

run({
  appGitBranch: argv.b as string,
  appGitRepo: argv.r as string,
  appName: argv.n as string,
  resourceGroupName: argv.g as string
})
  .then(r => {
    if (r) {
      winston.info("Successfully synced app with source control");
    } else {
      winston.warn("Nothing happened");
    }
  })
  .catch((e: Error) => console.error(process.env.VERBOSE ? e : e.message));
