/**
 * This file export a method used to parse and validate
 * the resources configuration file (from a json to a typed interface).
 */
// tslint:disable:no-any
// tslint:disable:object-literal-sort-keys

import * as fs from "fs";

function failIfempty(str: string): string {
  if (!str) {
    throw new TypeError("empty string not allowed");
  }
  return str;
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
  const config = JSON.parse(fs.readFileSync(filePath, "utf8"));

  return {
    location: failIfempty((config as any).location),
    cosmosdb_failover_location: failIfempty(
      (config as any).cosmosdb_failover_location
    ),
    azurerm_resource_group: failIfempty((config as any).azurerm_resource_group),
    azurerm_storage_account: failIfempty(
      (config as any).azurerm_storage_account
    ),
    azurerm_storage_container: failIfempty(
      (config as any).azurerm_storage_container
    ),
    azurerm_storage_queue_emailnotifications: failIfempty(
      (config as any).azurerm_storage_queue_emailnotifications
    ),
    azurerm_storage_queue_createdmessages: failIfempty(
      (config as any).azurerm_storage_queue_createdmessages
    ),
    azurerm_cosmosdb: failIfempty((config as any).azurerm_cosmosdb),
    azurerm_cosmosdb_documentdb: failIfempty(
      (config as any).azurerm_cosmosdb_documentdb
    ),
    azurerm_cosmosdb_collections: (config as any).azurerm_cosmosdb_collections,
    azurerm_app_service_plan: failIfempty(
      (config as any).azurerm_app_service_plan
    ),
    azurerm_functionapp: failIfempty((config as any).azurerm_functionapp),
    azurerm_functionapp_slot: failIfempty(
      (config as any).azurerm_functionapp_slot
    ),
    functionapp_git_repo: (config as any).functionapp_git_repo,
    functionapp_git_branch: (config as any).functionapp_git_branch,
    functionapp_scm_type: (config as any).functionapp_scm_type,
    azurerm_application_insights: failIfempty(
      (config as any).azurerm_application_insights
    ),
    azurerm_log_analytics: failIfempty((config as any).azurerm_log_analytics),
    azurerm_apim: failIfempty((config as any).azurerm_apim),
    apim_email: failIfempty((config as any).apim_email),
    apim_publisher: failIfempty((config as any).apim_publisher),
    apim_sku: failIfempty((config as any).apim_sku),
    apim_scm_username: failIfempty((config as any).apim_scm_username),
    apim_scm_cred_username: failIfempty((config as any).apim_scm_cred_username),
    message_blob_container: failIfempty((config as any).message_blob_container)
  };
};
