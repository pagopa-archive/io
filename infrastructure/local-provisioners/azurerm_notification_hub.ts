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
  azurerm_notification_hub: t.string,
  azurerm_notification_hub_ns: t.string,
  azurerm_notification_hub_sku: t.union([
    t.literal("Free"),
    t.literal("Basic"),
    t.literal("Standard")
  ]),
  azurerm_resource_group: t.string,
  location: t.string,
  notification_hub_apns_app_id: t.string,
  // test (sandbox) and production endpoints for APNS
  // see https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingwithAPNs.html
  // they require different api keys
  notification_hub_apns_endpoint: t.union([
    t.literal("https://api.development.push.apple.com:443/3/device"),
    t.literal("https://api.push.apple.com:443/3/device")
  ]),
  notification_hub_apns_key: t.string,
  notification_hub_apns_key_id: t.string,
  notification_hub_apns_name: t.string,
  notification_hub_gcm_key: t.string
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
      enabled: true,
      location: params.location,
      namespaceType: "NotificationHub",
      sku: {
        name: params.azurerm_notification_hub_sku
      }
    }
  );

  if (!namespace || !namespace.name) {
    throw new Error("Cannot create NotificationHub namespace");
  }

  const creds = Object.assign(
    {},
    params.notification_hub_apns_key
      ? {
          apnsCredential: {
            appId: params.notification_hub_apns_app_id,
            appName: params.notification_hub_apns_name,
            endpoint: params.notification_hub_apns_endpoint,
            keyId: params.notification_hub_apns_key_id,
            token: params.notification_hub_apns_key
          }
        }
      : {},
    params.notification_hub_gcm_key
      ? {
          gcmCredential: {
            googleApiKey: params.notification_hub_gcm_key
          }
        }
      : {}
  );

  return notificationHubClient.notificationHubs.createOrUpdate(
    params.azurerm_resource_group,
    namespace.name,
    params.azurerm_notification_hub,
    {
      ...creds,
      location: params.location,
      sku: {
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
  // iOS
  .option("notification_hub_apns_app_id", {
    string: true
  })
  .option("notification_hub_apns_name", {
    string: true
  })
  .option("notification_hub_apns_key", {
    string: true
  })
  .option("notification_hub_apns_key_id", {
    string: true
  })
  .option("notification_hub_apns_endpoint", {
    string: true
  })
  // Android
  .option("notification_hub_gcm_key", {
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
