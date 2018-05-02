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

import yargs = require("yargs");

import * as winston from "winston";
import { login } from "../../lib/login";

import CosmosDBManagementClient = require("azure-arm-cosmosdb");

interface IRunParams {
  readonly azurerm_resource_group: string;
  readonly azurerm_cosmosdb: string;
  readonly ips: string;
}

export const run = async (params: IRunParams) => {
  const loginCreds = await login();

  // CosmosDB: restrict access to Functions IP
  const cosmosDbClient = new CosmosDBManagementClient.CosmosDBManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  const cosmosdb = await cosmosDbClient.databaseAccounts.get(
    params.azurerm_resource_group,
    params.azurerm_cosmosdb
  );

  // IP addresses/ranges must be comma separated and must not contain any spaces.
  const ipRangeFilter = Array.from(
    new Set(
      params.ips
        .trim()
        .split(",")
        .filter(ip => ip !== "")
    )
  ).join(",");

  if (cosmosdb.failoverPolicies) {
    winston.info(
      `Updating CosmosDB ipRangeFilter: [${
        cosmosdb.ipRangeFilter
      }] => [${ipRangeFilter}]`
    );

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
  } else {
    winston.warn(
      "Cannot update Cosmos configuration since failoverPolicies attribute is undefined"
    );
    process.exit(-1);
  }
};

const argv = yargs
  .alias("g", "resource-group-name")
  .demandOption("g")
  .string("g")
  .alias("c", "cosmosdb-name")
  .demandOption("c")
  .string("c")
  .alias("i", "ips")
  .demandOption("i")
  .string("i").argv;

run({
  azurerm_cosmosdb: argv.c as string,
  azurerm_resource_group: argv.g as string,
  ips: argv.i as string
})
  .then(() => winston.info("Successfully set up IP restrictions"))
  .catch((e: Error) => console.error(process.env.VERBOSE ? e : e.message));
