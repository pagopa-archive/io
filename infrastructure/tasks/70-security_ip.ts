/**
 * Run this task from command line to setup IP restrictions for
 * - 1. Storage accounts (allowing access from Functions and Azure portal)
 * - 2. CosmosDB account (allowing access from Functions and Azure portal)
 * - 3. Functions (allowing access from the API management)
 *
 * yarn resources:security:ip
 *
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as t from "io-ts";
import * as winston from "winston";

import { login } from "../../lib/login";

import yargs = require("yargs");

import { getObjectFromJson } from "../../lib/config";

import { checkEnvironment } from "../../lib/environment";

import apiManagementClient = require("azure-arm-apimanagement");
import CosmosDBManagementClient = require("azure-arm-cosmosdb");
import storageManagementClient = require("azure-arm-storage");
import webSiteManagementClient = require("azure-arm-website");

import { IPRule } from "azure-arm-storage/lib/models";
import { IpSecurityRestriction } from "azure-arm-website/lib/models";

const TaskParams = t.interface({
  azurerm_resource_group: t.string,
  azurerm_functionapp: t.string,
  azurerm_storage_account: t.string,
  azurerm_functionapp_storage_account: t.string,
  azurerm_cosmosdb: t.string,
  azurerm_apim: t.string,
  azure_portal_ips: t.string,
  restrict_storage_access: t.boolean
});

type TaskParams = t.TypeOf<typeof TaskParams>;

// We need to allow this CIDR used by Azure for internal networking
const SHARED_ADDRESS_SPACE = "100.64.0.0/10";
const SHARED_ADDRESS_SPACE_IP = "100.64.0.0";
const SHARED_ADDRESS_SPACE_MASK = "255.192.0.0";

// tslint:disable-next-line:readonly-array
const uniqueIpRules = (ipRules: IPRule[]) => {
  const ipRulesMap = ipRules.reduce((prev, curr) => {
    const idx = curr.action + "_" + curr.iPAddressOrRange;
    return {
      ...prev,
      [idx]: curr
    };
  }, {});
  return Object.keys(ipRulesMap).map(k => (ipRulesMap as any)[k]);
};

// tslint:disable-next-line:readonly-array
const uniqueIpSecurityRestrictions = (ipRules: IpSecurityRestriction[]) => {
  const ipSecMap = ipRules.reduce((prev, curr) => {
    const idx = curr.ipAddress;
    return {
      ...prev,
      [idx]: curr
    };
  }, {});
  return Object.keys(ipSecMap).map(k => (ipSecMap as any)[k]);
};

export const run = async (params: TaskParams) => {
  const loginCreds = await login();

  // Get Functions IPs
  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  const functions = await webSiteClient.webApps.get(
    params.azurerm_resource_group,
    params.azurerm_functionapp
  );

  if (!functions.outboundIpAddresses) {
    throw new Error("Cannot get Functions IPs");
  }

  const functionIPs = functions.outboundIpAddresses.split(",");
  winston.info("Functions IPs: " + functions.outboundIpAddresses);

  // Get API management IPs
  const apiClient = new apiManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  const apim = await apiClient.apiManagementService.get(
    params.azurerm_resource_group,
    params.azurerm_apim
  );

  if (!Array.isArray(apim.staticIps)) {
    throw new Error("Cannot get API management IPs");
  }

  const apimIPs = apim.staticIps;
  winston.info("Api management IPs: " + apimIPs.join(","));

  // 1. Storage Account(s): restrict access to Functions IP
  // [#153344792] TODO: IP restrictions on storages are disabled
  // by now as they prevent Functions to work
  if (params.restrict_storage_access) {
    winston.info("Restrict access to Storage accounts from Functions IPs");

    const storageClient = new storageManagementClient(
      loginCreds.creds as any,
      loginCreds.subscriptionId
    );

    const functionsIpForStorage = functionIPs.map(ip => ({
      action: "Allow",
      iPAddressOrRange: ip
    }));

    const azurePortalIpForStorage = params.azure_portal_ips
      .split(",")
      .map(ip => ({
        action: "Allow",
        iPAddressOrRange: ip
      }));

    const storageProperties = await storageClient.storageAccounts.getProperties(
      params.azurerm_resource_group,
      params.azurerm_storage_account
    );

    if (
      !storageProperties.networkRuleSet ||
      !storageProperties.networkRuleSet.ipRules
    ) {
      throw new Error("Cannot get IP rules from storage");
    }

    winston.info("Restrict access to Queue and Blob storage account");

    await storageClient.storageAccounts.update(
      params.azurerm_resource_group,
      params.azurerm_storage_account,
      {
        enableHttpsTrafficOnly: true,
        networkRuleSet: {
          defaultAction: "Deny",
          ipRules: uniqueIpRules([
            { action: "Allow", iPAddressOrRange: SHARED_ADDRESS_SPACE },
            ...functionsIpForStorage,
            ...azurePortalIpForStorage,
            ...storageProperties.networkRuleSet.ipRules
          ])
        }
      }
    );

    const storageFunctionsProperties = await storageClient.storageAccounts.getProperties(
      params.azurerm_resource_group,
      params.azurerm_storage_account
    );

    if (
      !storageFunctionsProperties.networkRuleSet ||
      !storageFunctionsProperties.networkRuleSet.ipRules
    ) {
      throw new Error("Cannot get IP rules from Functions storage");
    }

    winston.info("Restrict access to the Functions storage account");

    await storageClient.storageAccounts.update(
      params.azurerm_resource_group,
      params.azurerm_functionapp_storage_account,
      {
        enableHttpsTrafficOnly: true,
        networkRuleSet: {
          defaultAction: "Deny",
          ipRules: uniqueIpRules([
            { action: "Allow", iPAddressOrRange: SHARED_ADDRESS_SPACE },
            ...functionsIpForStorage,
            ...azurePortalIpForStorage,
            ...storageFunctionsProperties.networkRuleSet.ipRules
          ])
        }
      }
    );
  }

  // 2. CosmosDB: restrict access to Functions IP
  const cosmosDbClient = new CosmosDBManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  const cosmosdb = await cosmosDbClient.databaseAccounts.get(
    params.azurerm_resource_group,
    params.azurerm_cosmosdb
  );

  if (cosmosdb.failoverPolicies) {
    // IP addresses/ranges must be comma separated and must not contain any spaces.
    const ipRangeFilter = Array.from(
      new Set(
        [
          [SHARED_ADDRESS_SPACE],
          functionIPs,
          params.azure_portal_ips.split(",").map(s => s.trim()),
          (cosmosdb.ipRangeFilter || "").split(",")
        ]
          .reduce((a, b) => a.concat(b), [])
          .filter(ip => ip !== "")
      )
    ).join(",");

    winston.info("Restrict the access to CosmosDB from Functions");

    // This ovverrides unset parameters
    await cosmosDbClient.databaseAccounts.createOrUpdate(
      params.azurerm_resource_group,
      params.azurerm_cosmosdb,
      {
        consistencyPolicy: cosmosdb.consistencyPolicy,
        enableAutomaticFailover: cosmosdb.enableAutomaticFailover,
        id: cosmosdb.id,
        ipRangeFilter,
        kind: cosmosdb.kind,
        location: cosmosdb.location,
        // for some odd reason "locations" here equals failoverPolicies
        // see https://github.com/terraform-providers/terraform-provider-azurerm/blob/master/azurerm/resource_arm_cosmos_db_account.go#L167
        locations: cosmosdb.failoverPolicies,
        name: cosmosdb.name,
        tags: cosmosdb.tags,
        type: cosmosdb.type
      }
    );
  }

  // 3. Functions: restrict access to API management IPs
  const configuration = await webSiteClient.webApps.getConfiguration(
    params.azurerm_resource_group,
    params.azurerm_functionapp
  );

  const azurePortalAddresses = params.azure_portal_ips.split(",").map(s => ({
    ipAddress: s.trim()
  }));

  const apimAddresses = apimIPs.map(s => ({
    ipAddress: s.trim()
  }));

  const newSiteConfig = {
    ...configuration,
    ipSecurityRestrictions: uniqueIpSecurityRestrictions([
      {
        ipAddress: SHARED_ADDRESS_SPACE_IP,
        subnetMask: SHARED_ADDRESS_SPACE_MASK
      },
      ...(configuration.ipSecurityRestrictions || []),
      ...azurePortalAddresses,
      ...apimAddresses
    ])
  };

  winston.info(
    "Restrict access to Functions from IPs: " +
      newSiteConfig.ipSecurityRestrictions.map(ip => ip.ipAddress).join(",")
  );

  await webSiteClient.webApps.updateConfiguration(
    params.azurerm_resource_group,
    params.azurerm_functionapp,
    newSiteConfig
  );
};

const argv = yargs
  .option("azurerm_resource_group", {
    string: true
  })
  .option("azurerm_functionapp_storage_account", {
    string: true
  })
  .option("azurerm_cosmosdb", {
    string: true
  })
  .option("azurerm_apim", {
    string: true
  })
  .option("azure_portal_ips", {
    string: true
  })
  .option("azurerm_functionapp", {
    string: true
  })
  .option("restrict_storage_access", {
    boolean: true
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
