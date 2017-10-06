# Terraform configuration file to create Azure resources.
# Set up environment variables before running this script (see README.md)

# Uncomment the following lines if you prefer to use an Azure backend to store Terraform state.
# You *must* create the storage account and the container before running this script
#
# variable "terraform_state_storage_account" {
#     type = "string"
# }
# variable "terraform_state_storage_container" {
#     type = "string"
# }
# terraform {
#  backend "azurerm" {
#    storage_account_name = "${var.terraform_state_storage_account}"
#    container_name       = "${var.terraform_state_storage_container}"
#    key                  = "production.terraform.tfstate"
#  }
# }

# Location of the Azure resource group and services (ie. West Europe)
variable location {
    type = "string"
}

# Location for CosmosDB failover (ie. North Europe)
# Must differ from "location" value
variable "cosmosdb_failover_location" {
    type = "string"
}

# Name of the resource group
variable "azurerm_resource_group_00" {
    type = "string"
}

# Name of the storage account
variable "azurerm_storage_account_00" {
    type = "string"
} 

# Name of the storage container resource
variable "azurerm_storage_container_00" {
    type = "string"
}

# Name of the storage queue for email notifications
variable "azurerm_storage_queue_emailnotifications_00" {
    type = "string"
}

# Name of the storage queue for created messages
variable "azurerm_storage_queue_createdmessages_00" {
    type = "string"
}

# Name of the CosmosDB account
variable "azurerm_cosmosdb_00" {
    type = "string"
}

# Name of the App Service Plan resource
variable "azurerm_app_service_plan_00" {
    type = "string"
}

# Name of Application Insights resource
variable "azurerm_application_insights_00" {
    type = "string"
}

# Name of Log Analytics resource
variable "azurerm_log_analytics_00" {
    type = "string"    
}

# module "variables" {
#     source = "./modules/variables"
# }

## RESOURCE GROUP

# Create a resource group if it doesn’t exist
resource "azurerm_resource_group" "azurerm_resource_group_00" {
    name     = "${var.azurerm_resource_group_00}"
    location = "${var.location}"
    tags {
        environment = "production"
    }
}

## STORAGE

resource "azurerm_storage_account" "azurerm_storage_account_00" {
    name                = "${var.azurerm_storage_account_00}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group_00.name}"
    location            = "${azurerm_resource_group.azurerm_resource_group_00.location}"

    # can be one between Premium_LRS, Standard_GRS, Standard_LRS, Standard_RAGRS, Standard_ZRS
    # see https://docs.microsoft.com/en-us/azure/storage/common/storage-redundancy
    account_type = "Standard_GRS"

    # see https://docs.microsoft.com/en-us/azure/storage/common/storage-service-encryption
    enable_blob_encryption = true

    tags {
        environment = "production"
    }
}

resource "azurerm_storage_container" "azurerm_storage_container_00" {
    name                    = "${var.azurerm_storage_container_00}"
    resource_group_name     = "${azurerm_resource_group.azurerm_resource_group_00.name}"
    storage_account_name    = "${azurerm_storage_account.azurerm_storage_account_00.name}"

    # Can be either blob (to publish blob on internet),container (to publish everything) or private
    container_access_type   = "private"
}

## QUEUES

resource "azurerm_storage_queue" "azurerm_storage_queue_emailnotifications_00" {
    name                 = "${var.azurerm_storage_queue_emailnotifications_00}"
    resource_group_name  = "${azurerm_resource_group.azurerm_resource_group_00.name}"
    storage_account_name = "${azurerm_storage_account.azurerm_storage_account_00.name}"
}

resource "azurerm_storage_queue" "azurerm_storage_queue_createdmessages_00" {
    name                 = "${var.azurerm_storage_queue_createdmessages_00}"
    resource_group_name  = "${azurerm_resource_group.azurerm_resource_group_00.name}"
    storage_account_name = "${azurerm_storage_account.azurerm_storage_account_00.name}"
}

## DATABASE

resource "azurerm_cosmosdb_account" "azurerm_cosmosdb_00" {
    name                = "${var.azurerm_cosmosdb_00}"
    location            = "${azurerm_resource_group.azurerm_resource_group_00.location}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group_00.name}"
  
    # Possible values are GlobalDocumentDB and MongoDB
    kind = "GlobalDocumentDB"

    # Required - can be only set to Standard
    offer_type          = "Standard"
  
    # Can be either BoundedStaleness, Eventual, Session or Strong
    # see https://docs.microsoft.com/en-us/azure/cosmos-db/consistency-levels
    consistency_policy {
        consistency_level = "BoundedStaleness"
    }

    failover_policy {
        location = "${var.cosmosdb_failover_location}"
        priority = 0
    }

    tags {
        environment = "production"
    }

    ## !!! DATABASE AND COLLECTIONS ARE NOT SUPPORTED: we create them manually
    # provisioner "local-exec" {
    #   command = "ts-node ./tasks/cosmosdb.ts"
    # }
}

## APPLICATION INSIGHTS

resource "azurerm_application_insights" "azurerm_application_insights_00" {
    name                = "${var.azurerm_application_insights_00}"
    location            = "${azurerm_resource_group.azurerm_resource_group_00.location}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group_00.name}"
    # Web or Other
    application_type    = "Web"
}

## APP SERVICE PLAN

resource "azurerm_app_service_plan" "azurerm_app_service_plan_00" {
    name                = "${var.azurerm_app_service_plan_00}"
    location            = "${azurerm_resource_group.azurerm_resource_group_00.location}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group_00.name}"

    sku {
        tier = "Standard"
        # Possible values are B1, B2, B3, D1, F1, FREE, P1, P2, P3, S1, S2, S3, SHARED
        size = "S1"
    }

    ## !!! FUNCTIONS APP ARE NOT SUPPORTED: we create them manually
    # provisioner "local-exec" {
    #    command = "ts-node ./tasks/functions.ts"
    # }
}

## !!! API MANAGER NOT SUPPORTED

# Logging (OSM)

resource "azurerm_log_analytics_workspace" "azurerm_log_analytics_00" {
    name                = "${var.azurerm_log_analytics_00}"
    location            = "${azurerm_resource_group.azurerm_resource_group_00.location}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group_00.name}"
    sku                 = "Standard"
    retention_in_days   = 30
}
