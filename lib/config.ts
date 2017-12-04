/**
 * This file export a method used to parse and validate
 * the resources configuration file (from a json to a typed interface).
 */
// tslint:disable:no-any
// tslint:disable:object-literal-sort-keys

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as readlineSync from "readline-sync";
import * as winston from "winston";

import * as t from "io-ts";
import { failure } from "io-ts/lib/PathReporter";

// read environment variables from .env file
dotenv.config();

winston.configure({
  level: process.env.VERBOSE ? "debug" : "info",
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ]
});

// configuration file to feed terraform settings
const TF_VARS_FILE_NAME = "tfvars.json";

// configuration file with variables used from tasks
const COMMON_CONFIG_FILE_NAME = "config.json";

const Api = t.interface({
  specsPath: t.string,
  displayName: t.string,
  path: t.string
});

const ApiDescription = t.interface({
  id: t.string,
  api: Api,
  products: t.array(t.string),
  policyFile: t.string
});

const CosmosCollection = t.interface({
  name: t.string,
  partitionKey: t.string
});

const ResourcesConfiguration = t.interface({
  apim_admin_email: t.string,
  apim_admin_firstname: t.string,
  apim_admin_groups: t.array(t.string),
  apim_admin_lastname: t.string,
  apim_admin_oid: t.string,
  apim_admin_product: t.string,
  apim_apis: t.array(ApiDescription),
  apim_email: t.string,
  apim_logger_id: t.string,
  apim_publisher: t.string,
  apim_scm_cred_username: t.string,
  apim_scm_username: t.string,
  apim_sku: t.string,
  app_service_portal_git_branch: t.string,
  app_service_portal_git_repo: t.string,
  app_service_portal_scm_type: t.string,
  azure_portal_ips: t.array(t.string),
  azurerm_adb2c_policy: t.string,
  azurerm_apim: t.string,
  azurerm_apim_eventhub: t.string,
  azurerm_apim_eventhub_rule: t.string,
  azurerm_app_service_plan: t.string,
  azurerm_app_service_plan_portal: t.string,
  azurerm_app_service_portal: t.string,
  azurerm_application_insights: t.string,
  azurerm_cosmosdb: t.string,
  azurerm_cosmosdb_collections: t.array(CosmosCollection),
  azurerm_cosmosdb_documentdb: t.string,
  azurerm_eventhub_ns: t.string,
  azurerm_functionapp: t.string,
  azurerm_functionapp_slot: t.string,
  azurerm_functionapp_storage_account: t.string,
  azurerm_log_analytics: t.string,
  azurerm_resource_group: t.string,
  azurerm_storage_account: t.string,
  azurerm_storage_container: t.string,
  azurerm_storage_queue_createdmessages: t.string,
  azurerm_storage_queue_emailnotifications: t.string,
  cosmosdb_failover_location: t.string,
  environment: t.string,
  functionapp_git_branch: t.string,
  functionapp_git_repo: t.string,
  functionapp_nodejs_version: t.string,
  functionapp_scm_type: t.string,
  location: t.string,
  message_blob_container: t.string
});

export type IResourcesConfiguration = t.TypeOf<typeof ResourcesConfiguration>;

/**
 * Merge and parses configuration files.
 * Throws an Exception and exit on any kind of error.
 */
export const readConfig = (
  environment: string
): Promise<IResourcesConfiguration> => {
  return new Promise(resolve => {
    // Get Terraform configuration from JSON
    const tfFilePath = path.join(
      __dirname,
      "..",
      "infrastructure",
      "env",
      environment,
      TF_VARS_FILE_NAME
    );
    if (!fs.existsSync(tfFilePath)) {
      throw new Error("Cannot find configuration file: " + tfFilePath);
    }
    const tfConfig = JSON.parse(fs.readFileSync(tfFilePath, "utf8"));

    // Get Common configuration from JSON
    const commonConfigFilePath = path.join(
      "",
      __dirname,
      "..",
      "infrastructure",
      "env",
      "common",
      COMMON_CONFIG_FILE_NAME
    );
    if (!fs.existsSync(commonConfigFilePath)) {
      throw new Error(
        "Cannot find configuration file: " + commonConfigFilePath
      );
    }
    const commonConfig = JSON.parse(
      fs.readFileSync(commonConfigFilePath, "utf8")
    );

    // Merge Common configuration with Terraform configuration
    const config = { ...commonConfig, ...tfConfig };

    t.validate(config, ResourcesConfiguration).fold(errors => {
      throw new Error(failure(errors).join("\n"));
    }, t.identity);

    if (
      !process.env.NPMDEPLOY &&
      !readlineSync.keyInYNStrict(
        `Do you want to proceed with this configuration (${environment}) ?`
      )
    ) {
      throw new Error("Aborted.");
    }

    return resolve(config);
  });
};
