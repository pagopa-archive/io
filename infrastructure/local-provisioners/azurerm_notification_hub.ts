/**
 * This task deploys Azure Notification hub.
 *
 * This task assumes that the following resources are already created:
 *  - Resource group
 *
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as t from "io-ts";
import * as winston from "winston";

import notificationHubMgmt = require("azure-arm-notificationhubs");
import yargs = require("yargs");

import { checkEnvironment } from "../../lib/environment";
import { login } from "../../lib/login";

import { getObjectFromJson } from "../../lib/config";

/**
 * ApiParams contains the variables taken from command line (provisioner arguments)
 * that represents values that *change* between different deploying environments.
 */
const ApimParams = t.interface({
  location: t.string,
  azurerm_resource_group: t.string,
  azurerm_notification_hub: t.string,
  azurerm_notification_hub_ns: t.string,
  azurerm_notification_hub_sku: t.union([
    t.literal("Free"),
    t.literal("Basic"),
    t.literal("Standard")
  ])
});

type ApimParams = t.TypeOf<typeof ApimParams>;

export const run = async (params: ApimParams) => {
  const loginCreds = await login();

  const notificationHubClient = new notificationHubMgmt(
    loginCreds.creds,
    loginCreds.subscriptionId
  );

  const namespace = await notificationHubClient.namespaces.createOrUpdate(
    params.azurerm_resource_group,
    params.azurerm_notification_hub_ns,
    {
      location: params.location,
      namespaceType: "NotificationHub",
      enabled: true,
      sku: {
        // "Basic", "Free", "Standard"
        name: params.azurerm_notification_hub_sku
      }
    }
  );

  if (!namespace || !namespace.name) {
    throw new Error("Cannot create NotificationHub namespace");
  }

  return notificationHubClient.notificationHubs.createOrUpdate(
    params.azurerm_resource_group,
    namespace.name,
    params.azurerm_notification_hub,
    {
      location: params.location,
      // apnsCredential
      // gcmCredential
      sku: {
        // "Basic", "Free", "Standard"
        name: params.azurerm_notification_hub_sku
      }
    }
  );
};

const argv = yargs
  .option("location", {
    demandOption: true,
    string: true
  })
  .option("azurerm_resource_group", {
    string: true
  })
  .option("azurerm_notification_hub", {
    string: true
  })
  .option("azurerm_notification_hub_ns", {
    string: true
  })
  .option("azurerm_notification_hub_sku", {
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
