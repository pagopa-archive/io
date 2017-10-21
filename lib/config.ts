/**
 * This file export a method used to parse and validate
 * the resources configuration file (from a json to a typed interface).
 */
// tslint:disable:no-any
// tslint:disable:object-literal-sort-keys

import * as fs from "fs";

function failIfempty(
  what: string | ReadonlyArray<string>
): string | ReadonlyArray<string> {
  if (!what) {
    throw new TypeError("empty parameter not allowed in configuration file");
  }
  return what;
}

export interface IResourcesConfiguration {
  readonly location: string;
  readonly cosmosdb_failover_location: string;
  readonly azurerm_resource_group: string;
  readonly azurerm_storage_account: string;
  readonly azurerm_storage_container: string;
  readonly azurerm_storage_queue_emailnotifications: string;
  readonly azurerm_storage_queue_createdmessages: string;
  readonly azurerm_cosmosdb: string;
  readonly azurerm_cosmosdb_documentdb: string;
  readonly azurerm_cosmosdb_collections: ReadonlyArray<string>;
  readonly azurerm_app_service_plan: string;
  readonly azurerm_functionapp: string;
  readonly azurerm_functionapp_slot: string;
  readonly functionapp_git_repo: string;
  readonly functionapp_git_branch: string;
  readonly functionapp_scm_type: string;
  readonly functionapp_nodejs_version: string;
  readonly azurerm_functionapp_storage_account: string;
  readonly azurerm_application_insights: string;
  readonly azurerm_log_analytics: string;
  readonly azurerm_apim: string;
  readonly apim_email: string;
  readonly apim_publisher: string;
  readonly apim_sku: string;
  readonly apim_scm_username: string;
  readonly apim_scm_cred_username: string;
  readonly message_blob_container: string;
}

/**
 * Parses a configuration file.
 * Throws an Exception and exit on any kind of error.
 */
export default (filePath: string): IResourcesConfiguration => {
  const config = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  ) as IResourcesConfiguration;

  failIfempty(config.location);
  failIfempty(config.cosmosdb_failover_location);
  failIfempty(config.azurerm_resource_group);
  failIfempty(config.azurerm_storage_account);
  failIfempty(config.azurerm_storage_container);
  failIfempty(config.azurerm_storage_queue_emailnotifications);
  failIfempty(config.azurerm_storage_queue_createdmessages);
  failIfempty(config.azurerm_cosmosdb);
  failIfempty(config.azurerm_cosmosdb_documentdb);
  failIfempty(config.azurerm_cosmosdb_collections);
  failIfempty(config.azurerm_app_service_plan);
  failIfempty(config.azurerm_functionapp);
  failIfempty(config.azurerm_functionapp_slot);
  failIfempty(config.functionapp_nodejs_version);
  failIfempty(config.azurerm_functionapp_storage_account);
  failIfempty(config.azurerm_application_insights);
  failIfempty(config.azurerm_log_analytics);
  failIfempty(config.azurerm_apim);
  failIfempty(config.apim_email);
  failIfempty(config.apim_publisher);
  failIfempty(config.apim_sku);
  failIfempty(config.apim_scm_username);
  failIfempty(config.apim_scm_cred_username);
  failIfempty(config.message_blob_container);

  return config;
};
