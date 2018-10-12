/**
 * Run this task to sync Azure Functions staging slot
 * to the source control repository code branch
 * specified in the configuration file.
 *
 * yarn deploy:functions:sync
 *
 * This is equivalent to push the "Sync" button in the
 * Azure portal -> Functions -> Deployments blade.
 *
 * WARNING: this task does not sync the production slot.
 *
 * This task assumes that the following resources are already created:
 *  - Resource group
 *  - Functions (app service)
 *
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as t from "io-ts";
import * as winston from "winston";

import yargs = require("yargs");

import { login } from "../../lib/login";

import { checkEnvironment } from "../../lib/environment";

import webSiteManagementClient = require("azure-arm-website");
import { getObjectFromJson } from "../../lib/config";

const TaskParams = t.interface({
  azurerm_functionapp: t.string,
  azurerm_resource_group: t.string
});

type TaskParams = t.TypeOf<typeof TaskParams>;

export const run = async (params: TaskParams) => {
  const loginCreds = await login();

  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  winston.info("Sync Git repository to Function staging slot");

  return webSiteClient.webApps.syncRepository(
    params.azurerm_resource_group,
    params.azurerm_functionapp
  );
};

const argv = yargs
  .option("azurerm_resource_group", {
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
