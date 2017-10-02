# Terraform configuration file to deploy resouces to Azure.

# Set up this variables in your envinroment before running Terraform:
#   export ARM_SUBSCRIPTION_ID=<YOUR SUBSCRIPTION ID>
#   export ARM_CLIENT_ID=<SERVICE PRINCIPAL ID>
#   export ARM_CLIENT_SECRET=<SERVICE PRINCIPAL SECRET>
#   export ARM_TENANT_ID=<ACTIVE DIRECTORY DOMAIN ID>

# or write them down here:
#   provider "azurerm" {
#     subscription_id = "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
#     client_id       = "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
#     client_secret   = "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
#     tenant_id       = "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
#   }

# Make sure you have ts-node installed globally:
#   npm install -g ts-node

# Run this script with
# ./terraform.exe plan -var-file=tfvars.json

variable location {
    type = "string"
}

variable "cosmosdb_failover_location" {
    type = "string"
}

variable "azurerm_resource_group_00" {
    type = "string"
}

variable "azurerm_storage_account_00" {
    type = "string"
} 

variable "azurerm_storage_container_00" {
    type = "string"
}

variable "azurerm_storage_queues" {
    type    = "list"
}

variable "azurerm_cosmosdb_00" {
    type = "string"
}

variable "azurerm_app_service_plan_00" {
    type = "string"
}

variable "azurerm_application_insights_00" {
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
    resource_group_name = "${var.azurerm_resource_group_00}"

    location = "${var.location}"

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
    resource_group_name     = "${var.azurerm_resource_group_00}"
    storage_account_name    = "${var.azurerm_storage_account_00}"

    # Can be either blob (to publish blob on internet),container (to publish everything) or private
    container_access_type   = "private"
}

## QUEUES

resource "azurerm_storage_queue" "azurerm_storage_queue_00" {
    name                 = "${var.azurerm_storage_queues[0]}"
    resource_group_name  = "${var.azurerm_resource_group_00}"
    storage_account_name = "${var.azurerm_storage_account_00}"
}

resource "azurerm_storage_queue" "azurerm_storage_queue_01" {
    name                 = "${var.azurerm_storage_queues[1]}"
    resource_group_name  = "${var.azurerm_resource_group_00}"
    storage_account_name = "${var.azurerm_storage_account_00}"
}

## DATABASE

resource "azurerm_cosmosdb_account" "azurerm_cosmosdb_00" {
    name                = "${var.azurerm_cosmosdb_00}"
    location            = "${var.location}"
    resource_group_name = "${var.azurerm_resource_group_00}"
  
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
    provisioner "local-exec" {
        command = "ts-node ./tasks/cosmosdb.ts"
    }
}

## APPLICATION INSIGHTS

resource "azurerm_application_insights" "azurerm_application_insights_00" {
    name                = "${var.azurerm_application_insights_00}"
    location            = "${var.location}"
    resource_group_name = "${var.azurerm_resource_group_00}"
    # Web or Other
    application_type    = "Web"
}

## APP SERVICE PLAN

resource "azurerm_app_service_plan" "azurerm_app_service_plan_00" {
    name                = "${var.azurerm_app_service_plan_00}"
    location            = "${var.location}"
    resource_group_name = "${var.azurerm_resource_group_00}"

    sku {
        tier = "Standard"
        # Possible values are B1, B2, B3, D1, F1, FREE, P1, P2, P3, S1, S2, S3, SHARED
        size = "S1"
    }

    ## !!! FUNCTIONS APP ARE NOT SUPPORTED: we create them manually
    provisioner "local-exec" {
        command = "ts-node ./tasks/functions.ts"
    }
}

## !!! API MANAGER NOT SUPPORTED
