## STORAGE

variable "azurerm_cosmosdb_collections" {
  type        = "map"
  description = "Name and partition keys of collections that must exist in the CosmosDB database"
}

variable "cosmosdb_failover_location" {
  type        = "string"
  description = "Location for CosmosDB failover (ie. North Europe), Must differ from 'location'"
}

variable "message_blob_container" {
  default     = "message-content"
  description = "Name of the message container blob"
}

variable "cosmosdb_collection_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_cosmosdb_collection.ts"
}

variable "cosmosdb_iprange_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_cosmosdb_iprange.ts"
}


resource "azurerm_storage_account" "azurerm_storage_account" {
  name                = "${local.azurerm_storage_account_name}"
  resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
  location            = "${azurerm_resource_group.azurerm_resource_group.location}"

  # can be one between Premium_LRS, Standard_GRS, Standard_LRS, Standard_RAGRS, Standard_ZRS
  # see https://docs.microsoft.com/en-us/azure/storage/common/storage-redundancy
  account_tier = "Standard"

  account_replication_type = "GRS"

  # see https://docs.microsoft.com/en-us/azure/storage/common/storage-service-encryption
  enable_blob_encryption = true

  enable_https_traffic_only = true

  tags {
    environment = "${var.environment}"
  }
}

resource "azurerm_storage_account" "azurerm_functionapp_storage_account" {
  name                = "${local.azurerm_functionapp_storage_account_name}"
  resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
  location            = "${azurerm_resource_group.azurerm_resource_group.location}"

  # can be one between Premium_LRS, Standard_GRS, Standard_LRS, Standard_RAGRS, Standard_ZRS
  # see https://docs.microsoft.com/en-us/azure/storage/common/storage-redundancy
  account_tier = "Standard"

  account_replication_type = "GRS"

  # see https://docs.microsoft.com/en-us/azure/storage/common/storage-service-encryption
  enable_blob_encryption = true

  enable_https_traffic_only = true

  tags {
    environment = "${var.environment}"
  }
}

resource "azurerm_storage_container" "azurerm_storage_container" {
  name                 = "${local.azurerm_storage_container_name}"
  resource_group_name  = "${azurerm_resource_group.azurerm_resource_group.name}"
  storage_account_name = "${azurerm_storage_account.azurerm_storage_account.name}"

  # Can be either blob (to publish blob on internet),container (to publish everything) or private
  container_access_type = "private"
}
