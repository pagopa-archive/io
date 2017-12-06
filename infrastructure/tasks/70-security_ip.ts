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

import * as winston from "winston";
import { login } from "../../lib/login";

import { IResourcesConfiguration, readConfig } from "../../lib/config";
import { checkEnvironment } from "../../lib/environment";

import apiManagementClient = require("azure-arm-apimanagement");
import CosmosDBManagementClient = require("azure-arm-cosmosdb");
import storageManagementClient = require("azure-arm-storage");
import webSiteManagementClient = require("azure-arm-website");

import { IPRule } from "azure-arm-storage/lib/models";
import { IpSecurityRestriction } from "azure-arm-website/lib/models";

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

export const run = async (config: IResourcesConfiguration) => {
  const loginCreds = await login();

  // Get Functions IPs
  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  const functions = await webSiteClient.webApps.get(
    config.azurerm_resource_group,
    config.azurerm_functionapp
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
    config.azurerm_resource_group,
    config.azurerm_apim
  );

  if (!Array.isArray(apim.staticIps)) {
    throw new Error("Cannot get API management IPs");
  }

  const apimIPs = apim.staticIps;
  winston.info("Api management IPs: " + apimIPs.join(","));

  // 1. Storage Account(s): restrict access to Functions IP
  // [#153344792] TODO: IP restrictions on storages are disabled
  // by now as they prevent Functions to work
  if (process.env.RESTRICT_STORAGE_ACCESS) {
    winston.info("Restrict access to Storage accounts from Functions IPs");

    const storageClient = new storageManagementClient(
      loginCreds.creds as any,
      loginCreds.subscriptionId
    );

    const functionsIpForStorage = functionIPs.map(ip => ({
      action: "Allow",
      iPAddressOrRange: ip
    }));

    const azurePortalIpForStorage = config.azure_portal_ips.map(ip => ({
      action: "Allow",
      iPAddressOrRange: ip
    }));

    const storageProperties = await storageClient.storageAccounts.getProperties(
      config.azurerm_resource_group,
      config.azurerm_storage_account
    );

    if (
      !storageProperties.networkRuleSet ||
      !storageProperties.networkRuleSet.ipRules
    ) {
      throw new Error("Cannot get IP rules from storage");
    }

    winston.info("Restrict access to Queue and Blob storage account");

    await storageClient.storageAccounts.update(
      config.azurerm_resource_group,
      config.azurerm_storage_account,
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
      config.azurerm_resource_group,
      config.azurerm_storage_account
    );

    if (
      !storageFunctionsProperties.networkRuleSet ||
      !storageFunctionsProperties.networkRuleSet.ipRules
    ) {
      throw new Error("Cannot get IP rules from Functions storage");
    }

    winston.info("Restrict access to the Functions storage account");

    await storageClient.storageAccounts.update(
      config.azurerm_resource_group,
      config.azurerm_functionapp_storage_account,
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
    config.azurerm_resource_group,
    config.azurerm_cosmosdb
  );

  if (cosmosdb.failoverPolicies) {
    // IP addresses/ranges must be comma separated and must not contain any spaces.
    const ipRangeFilter = Array.from(
      new Set(
        [
          [SHARED_ADDRESS_SPACE],
          functionIPs,
          config.azure_portal_ips.map(s => s.trim()),
          (cosmosdb.ipRangeFilter || "").split(",")
        ]
          .reduce((a, b) => a.concat(b), [])
          .filter(ip => ip !== "")
      )
    ).join(",");

    winston.info("Restrict the access to CosmosDB from Functions");

    // This ovverrides unset parameters
    await cosmosDbClient.databaseAccounts.createOrUpdate(
      config.azurerm_resource_group,
      config.azurerm_cosmosdb,
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
    config.azurerm_resource_group,
    config.azurerm_functionapp
  );

  const azurePortalAddresses = config.azure_portal_ips.map(s => ({
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
    config.azurerm_resource_group,
    config.azurerm_functionapp,
    newSiteConfig
  );
};

checkEnvironment()
  .then(() => readConfig(process.env.ENVIRONMENT))
  .then(run)
  .then(() => winston.info("Successfully set up IP restrictions"))
  .catch((e: Error) => console.error(process.env.VERBOSE ? e : e.message));
