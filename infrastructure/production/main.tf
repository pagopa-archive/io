# Terraform configuration file to create Azure resources.
# Set up environment variables before running this script (see README.md)

provider "azurerm" {
  version = "~> 1.10.0"
}

provider "random" {
  version = "~> 1.1"
}

provider "null" {
  version = "~> 1.0"
}

# Set up an Azure backend to store Terraform state.
# You *must* create the storage account and the container before running this script

terraform {
  backend "azurerm" {}
}

# Compute name of resources
#
# Instead of explicitly defining the name of each resource, we use a convention
# to compose the name of the resource as: PREFIX-RESOURCE_TYPE-ENVIRONMENT_SHORT
#

locals {
  # Define resource names based on the following convention:
  # {azurerm_resource_name_prefix}-RESOURCE_TYPE-{environment_short}
  azurerm_resource_group_name = "${var.azurerm_resource_name_prefix}-rg-${var.environment_short}"

  azurerm_storage_account_name             = "${var.azurerm_resource_name_prefix}storage${var.environment_short}"
  azurerm_storage_container_name           = "${var.azurerm_resource_name_prefix}-storage-${var.environment_short}"
  azurerm_cosmosdb_name                    = "${var.azurerm_resource_name_prefix}-cosmosdb-${var.environment_short}"
  azurerm_cosmosdb_documentdb_name         = "${var.azurerm_resource_name_prefix}-documentdb-${var.environment_short}"
  azurerm_app_service_plan_name            = "${var.azurerm_resource_name_prefix}-app-${var.environment_short}"
  azurerm_functionapp_name                 = "${var.azurerm_resource_name_prefix}-functions-${var.environment_short}"
  azurerm_functionapp_storage_account_name = "${var.azurerm_resource_name_prefix}funcstorage${var.environment_short}"
  azurerm_application_insights_name        = "${var.azurerm_resource_name_prefix}-appinsights-${var.environment_short}"
  azurerm_app_service_plan_portal_name     = "${var.azurerm_resource_name_prefix}-portal-app-${var.environment_short}"
  azurerm_app_service_portal_name          = "${var.azurerm_resource_name_prefix}-portal-${var.environment_short}"
  azurerm_log_analytics_name               = "${var.azurerm_resource_name_prefix}-loganalytics-${var.environment_short}"
  azurerm_apim_name                        = "${var.azurerm_resource_name_prefix}-apim-${var.environment_short}"
  azurerm_eventhub_ns_name                 = "${var.azurerm_resource_name_prefix}-eventhub-ns-${var.environment_short}"
  azurerm_apim_eventhub_name               = "${var.azurerm_resource_name_prefix}-apim-eventhub-${var.environment_short}"
  azurerm_notification_hub                 = "${var.azurerm_resource_name_prefix}-notificationhub-${var.environment_short}"
  azurerm_notification_hub_ns              = "${var.azurerm_resource_name_prefix}-notificationhubns-${var.environment_short}"
  azurerm_kubernetes_name                  = "${var.azurerm_resource_name_prefix}-k8s-${var.environment_short}"
  azurerm_kubernetes_public_ip_name        = "${var.azurerm_resource_name_prefix}-k8s-ip-${var.environment_short}"
  azurerm_redis_cache_name                 = "${var.azurerm_resource_name_prefix}-redis-${var.environment_short}"
  azurerm_redis_backup_name                = "${var.azurerm_resource_name_prefix}redisbck${var.environment_short}"
  azurerm_redis_vnet_name                  = "${var.azurerm_resource_name_prefix}-redis-vnet-${var.environment_short}"
}

#
# Data resources
#

# We need the configuration of the Azure Resource Manager provider for some
# resources that need to create other resources themselves (i.e. Kubernetes)
data "azurerm_client_config" "current" {}

## RESOURCE GROUP

# Create a resource group if it doesn’t exist
resource "azurerm_resource_group" "azurerm_resource_group" {
  name     = "${local.azurerm_resource_group_name}"
  location = "${var.location}"

  tags {
    environment = "${var.environment}"
  }
}

