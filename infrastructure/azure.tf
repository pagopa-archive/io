# Terraform configuration file to create Azure resources.
# Set up environment variables before running this script (see README.md)

provider "azurerm" {
  version = "~> 1.0"
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
    backend "azurerm" {
        resource_group_name  = "terraform-resource-group"
        storage_account_name = "terraformstorageaccount"
        container_name       = "terraform-storage-container"
    }
}

# Environment: production, developement or staging
variable environment {
    type = "string"
}

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
variable "azurerm_resource_group" {
    type = "string"
}

# Name of the storage account
variable "azurerm_storage_account" {
    type = "string"
}

# Name of the storage container resource
variable "azurerm_storage_container" {
    type = "string"
}

variable "message_blob_container" {
  default = "message-content"
  description = "Name of the message container blob"
}

variable "azurerm_functionapp" {
  type = "string"
  description = "Name of the main Functions application"
}

variable "azurerm_functionapp_storage_account" {
  type = "string"
  description = "Name of the storage account for functions"
}

variable "azurerm_functionapp_git_repo" {
  default = "https://github.com/teamdigitale/digital-citizenship-functions"
  description = "The GitHub repository that must be associated to the function app"
}

variable "azurerm_functionapp_git_branch" {
  default = "funcpack-release-latest"
  description = "The branch of the GitHub repository that must be associated to the function app"
}

# Name of the storage queue for email notifications
variable "azurerm_storage_queue_emailnotifications" {
    type = "string"
}

# Name of the storage queue for created messages
variable "azurerm_storage_queue_createdmessages" {
    type = "string"
}

# Name of the CosmosDB account
variable "azurerm_cosmosdb" {
    type = "string"
}

variable "azurerm_cosmosdb_documentdb" {
  type = "string"
  description = "Name of CosmosDB Database"
}

variable "azurerm_cosmosdb_collections" {
  type = "map"
  description = "Name and partition keys of collections that must exist in the CosmosDB database"
}

# Name of the App Service Plan resource
variable "azurerm_app_service_plan" {
    type = "string"
}

# Name of the App Service Plan for developer portal
variable "azurerm_app_service_plan_portal" {
    type = "string"
}

# Name of the App Service for developer portal
variable "azurerm_app_service_portal" {
    type = "string"
}

variable "app_service_portal_git_repo" {
  type = "string"
  description = "URL of the GitHub repository providing the source of the App Service Portal"
}

variable "app_service_portal_git_branch" {
  default = "master"
  description = "Branch of the GitHub repository providing the source of the App Service Portal"
}

# Redirect to this page after developer portal login
variable "app_service_portal_post_login_url" {
    type = "string"
}

# Redirect to this page after developer portal logout
variable "app_service_portal_post_logout_url" {
    type = "string"
}

# Name of the API management resource
variable "azurerm_apim" {
    type = "string"
}

# Name of the ADB2C policy
variable "azurerm_adb2c_policy" {
    type = "string"
}

# Name of Application Insights resource
variable "azurerm_application_insights" {
    type = "string"
}

# Name of Log Analytics resource
variable "azurerm_log_analytics" {
    type = "string"
}

# EventHub namespace
variable "azurerm_eventhub_ns" {
    type = "string"
}

# EventHub logger for API management
variable "azurerm_apim_eventhub" {
    type = "string"
}

# EventHub rule for API management
variable "azurerm_apim_eventhub_rule" {
    type = "string"
}

# This should be passed bya ENV var TF_VAR_SENDGRID_KEY
variable "SENDGRID_KEY" {
  type = "string"
  description = "The API key for the SendGrid service"
}

# module "variables" {
#     source = "./modules/variables"
# }

variable "cosmosdb_collection_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_cosmosdb_collection.ts"
}

variable "website_git_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_website_git.ts"
}

## RESOURCE GROUP

# Create a resource group if it doesn’t exist
resource "azurerm_resource_group" "azurerm_resource_group" {
    name     = "${var.azurerm_resource_group}"
    location = "${var.location}"
    tags {
        environment = "${var.environment}"
    }
}

## STORAGE

resource "azurerm_storage_account" "azurerm_storage_account" {
    name                = "${var.azurerm_storage_account}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
    location            = "${azurerm_resource_group.azurerm_resource_group.location}"

    # can be one between Premium_LRS, Standard_GRS, Standard_LRS, Standard_RAGRS, Standard_ZRS
    # see https://docs.microsoft.com/en-us/azure/storage/common/storage-redundancy
    account_tier             = "Standard"
    account_replication_type = "GRS"

    # see https://docs.microsoft.com/en-us/azure/storage/common/storage-service-encryption
    enable_blob_encryption = true

    enable_https_traffic_only = true

    tags {
        environment = "${var.environment}"
    }
}

resource "azurerm_storage_account" "azurerm_functionapp_storage_account" {
    name                = "${var.azurerm_functionapp_storage_account}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
    location            = "${azurerm_resource_group.azurerm_resource_group.location}"

    # can be one between Premium_LRS, Standard_GRS, Standard_LRS, Standard_RAGRS, Standard_ZRS
    # see https://docs.microsoft.com/en-us/azure/storage/common/storage-redundancy
    account_tier             = "Standard"
    account_replication_type = "GRS"

    # see https://docs.microsoft.com/en-us/azure/storage/common/storage-service-encryption
    enable_blob_encryption = true

    enable_https_traffic_only = true

    tags {
        environment = "${var.environment}"
    }
}

resource "azurerm_storage_container" "azurerm_storage_container" {
    name                    = "${var.azurerm_storage_container}"
    resource_group_name     = "${azurerm_resource_group.azurerm_resource_group.name}"
    storage_account_name    = "${azurerm_storage_account.azurerm_storage_account.name}"

    # Can be either blob (to publish blob on internet),container (to publish everything) or private
    container_access_type   = "private"
}

## QUEUES

resource "azurerm_storage_queue" "azurerm_storage_queue_emailnotifications" {
    name                 = "${var.azurerm_storage_queue_emailnotifications}"
    resource_group_name  = "${azurerm_resource_group.azurerm_resource_group.name}"
    storage_account_name = "${azurerm_storage_account.azurerm_storage_account.name}"
}

resource "azurerm_storage_queue" "azurerm_storage_queue_createdmessages" {
    name                 = "${var.azurerm_storage_queue_createdmessages}"
    resource_group_name  = "${azurerm_resource_group.azurerm_resource_group.name}"
    storage_account_name = "${azurerm_storage_account.azurerm_storage_account.name}"
}

## BLOBS

resource "azurerm_storage_blob" "azurerm_message_blob" {
  name = "${var.message_blob_container}"

  resource_group_name    = "${azurerm_resource_group.azurerm_resource_group.name}"
  storage_account_name   = "${azurerm_storage_account.azurerm_storage_account.name}"
  storage_container_name = "${azurerm_storage_container.azurerm_storage_container.name}"

  type = "block"
}

## DATABASE

resource "azurerm_cosmosdb_account" "azurerm_cosmosdb" {
    name                = "${var.azurerm_cosmosdb}"
    location            = "${azurerm_resource_group.azurerm_resource_group.location}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"

    # Possible values are GlobalDocumentDB and MongoDB
    kind = "GlobalDocumentDB"

    # Required - can be only set to Standard
    offer_type          = "Standard"

    # Can be either BoundedStaleness, Eventual, Session or Strong
    # see https://docs.microsoft.com/en-us/azure/cosmos-db/consistency-levels
    # Note: with the default BoundedStaleness settings CosmosDB cannot perform failover / replication:
    #   Operations (max_staleness): for a single region the maximum operations lag must be between 10 and 1 000 000
    #               for the multi region, it will be between 100 000 and 1 000 000
    #   Time (max_interval_in_seconds): the maximum lag must be between 5 seconds and 1 day for either single or multi-regions
    consistency_policy {
        consistency_level = "Session"
    }

    failover_policy {
        location = "${var.cosmosdb_failover_location}"
        priority = 0
    }

    tags {
        environment = "${var.environment}"
    }

    ## !!! DATABASE AND COLLECTIONS ARE NOT SUPPORTED: we create them manually
    # provisioner "local-exec" {
    #   command = "ts-node ./tasks/cosmosdb.ts"
    # }
}

resource "null_resource" "azurerm_cosmosdb_collections" {
  triggers = {
    cosmosdb_id = "${azurerm_cosmosdb_account.azurerm_cosmosdb.id}"

    # serialize the collection data to json so that the provisioner will be
    # triggered when collections get added or changed
    # NOTE: when a collection gets removed from the config it will NOT be
    # removed by the provisioner (the provisioner only creates collections)
    collections_json = "${jsonencode(var.azurerm_cosmosdb_collections)}"

    # increment the following value when changing the provisioner script to
    # trigger the re-execution of the script
    # TODO: consider using the hash of the script content instead
    provisioner_version = "5"
  }

  count = "${length(keys(var.azurerm_cosmosdb_collections))}"

  provisioner "local-exec" {
    command = "ts-node ${var.cosmosdb_collection_provisioner} --resource-group-name ${azurerm_resource_group.azurerm_resource_group.name} --cosmosdb-account-name ${azurerm_cosmosdb_account.azurerm_cosmosdb.name} --cosmosdb-documentdb-name ${var.azurerm_cosmosdb_documentdb} --cosmosdb-collection-name ${element(keys(var.azurerm_cosmosdb_collections), count.index)} -cosmosdb-collection-partition-key ${lookup(var.azurerm_cosmosdb_collections, element(keys(var.azurerm_cosmosdb_collections), count.index))}"
  }
}

## APPLICATION INSIGHTS

resource "azurerm_application_insights" "azurerm_application_insights" {
    name                = "${var.azurerm_application_insights}"
    location            = "${azurerm_resource_group.azurerm_resource_group.location}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
    # Web or Other
    application_type    = "Web"
}

## APP SERVICE PLAN

resource "azurerm_app_service_plan" "azurerm_app_service_plan" {
    name                = "${var.azurerm_app_service_plan}"
    location            = "${azurerm_resource_group.azurerm_resource_group.location}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"

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

## FUNCTIONS

resource "azurerm_function_app" "azurerm_function_app" {
  name                      = "${var.azurerm_functionapp}"
  location                  = "${azurerm_resource_group.azurerm_resource_group.location}"
  resource_group_name       = "${azurerm_resource_group.azurerm_resource_group.name}"
  app_service_plan_id       = "${azurerm_app_service_plan.azurerm_app_service_plan.id}"
  storage_connection_string = "${azurerm_storage_account.azurerm_functionapp_storage_account.primary_connection_string}"
  version                   = "~1"

  site_config = {
    # We don't want the express server to idle
    # so do not set `alwaysOn: false` in production
    always_on = true
  }

  app_settings = {
    # "AzureWebJobsStorage" = "${azurerm_storage_account.azurerm_functionapp_storage_account.primary_connection_string}"
    # "AzureWebJobsDashboard" = "${azurerm_storage_account.azurerm_functionapp_storage_account.primary_connection_string}"

    "COSMOSDB_NAME" = "${var.azurerm_cosmosdb_documentdb}"

    "QueueStorageConnection" = "${azurerm_storage_account.azurerm_storage_account.primary_connection_string}"

    "APPINSIGHTS_INSTRUMENTATIONKEY" = "${azurerm_application_insights.azurerm_application_insights.instrumentation_key}"

    # Avoid edit functions code from the Azure portal
    "FUNCTION_APP_EDIT_MODE" = "readonly"

    # AzureWebJobsSecretStorageType may be `disabled` or `Blob`
    # When set to `Blob` the API manager task won't be able
    # to retrieve the master key
    "AzureWebJobsSecretStorageType" = "disabled"

    "WEBSITE_HTTPLOGGING_RETENTION_DAYS" = "3"

    "DIAGNOSTICS_AZUREBLOBRETENTIONINDAYS" = "1"

    "WEBSITE_NODE_DEFAULT_VERSION" = "6.11.2"

    "SCM_USE_FUNCPACK_BUILD" = "1"

    "MESSAGE_CONTAINER_NAME" = "${azurerm_storage_blob.azurerm_message_blob.name}"
  }

  connection_string = [
    # [#152800384] - TODO: change the following value
    # when we'll migrate to production service
    {
      name = "SENDGRID_KEY"
      type = "Custom"
      value = "${var.SENDGRID_KEY}"
    },
    {
      name = "COSMOSDB_URI"
      type = "Custom"
      value = "https://${azurerm_cosmosdb_account.azurerm_cosmosdb.name}.documents.azure.com:443/"
    },
    {
      name = "COSMOSDB_KEY"
      type = "Custom"
      value = "${azurerm_cosmosdb_account.azurerm_cosmosdb.primary_master_key}"
    }
  ]
}

resource "null_resource" "azurerm_function_app_git" {
  triggers = {
    azurerm_functionapp_id = "${azurerm_function_app.azurerm_function_app.id}"

    # trigger recreation of this resource when the following variables change
    azurerm_functionapp_git_repo = "${var.azurerm_functionapp_git_repo}"
    azurerm_functionapp_git_branch = "${var.azurerm_functionapp_git_branch}"

    # increment the following value when changing the provisioner script to
    # trigger the re-execution of the script
    # TODO: consider using the hash of the script content instead
    provisioner_version = "1"
  }

  provisioner "local-exec" {
    command = "ts-node ${var.website_git_provisioner} --resource-group-name ${azurerm_resource_group.azurerm_resource_group.name} --app-name ${azurerm_function_app.azurerm_function_app.name} --git-repo ${var.azurerm_functionapp_git_repo} --git-branch ${var.azurerm_functionapp_git_branch}"
  }
}

### DEVELOPER PORTAL TASKS

resource "azurerm_app_service_plan" "azurerm_app_service_plan_portal" {
    name                = "${var.azurerm_app_service_plan_portal}"
    location            = "${azurerm_resource_group.azurerm_resource_group.location}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"

    sku {
        tier = "Standard"
        # Possible values are B1, B2, B3, D1, F1, FREE, P1, P2, P3, S1, S2, S3, SHARED
        size = "S1"
    }
}

resource "random_string" "cookie_key" {
  length = 32
}

resource "random_string" "cookie_iv" {
  length = 12
}

resource "azurerm_app_service" "azurerm_app_service_portal" {
    name                = "${var.azurerm_app_service_portal}"
    location            = "${azurerm_resource_group.azurerm_resource_group.location}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
    app_service_plan_id = "${azurerm_app_service_plan.azurerm_app_service_plan_portal.id}"

    site_config {
        always_on = true
    }

    # Go to https://github.com/teamdigitale/digital-citizenship-onboarding
    # to see how to fill these values
    app_settings {
        POLICY_NAME = "${var.azurerm_adb2c_policy}"
        WEBSITE_NODE_DEFAULT_VERSION = "6.5.0"
        COOKIE_KEY = "${random_string.cookie_key.result}"
        COOKIE_IV = "${random_string.cookie_iv.result}"
        LOG_LEVEL = "info"
        ARM_RESOURCE_GROUP = "${azurerm_resource_group.azurerm_resource_group.name}"
        ARM_APIM = "${var.azurerm_apim}"
        APIM_PRODUCT_NAME = "starter"
        APIM_USER_GROUPS = "ApiLimitedMessageWrite,ApiInfoRead,ApiMessageRead"
        ADMIN_API_URL = "https://${var.azurerm_apim}.azure-api.net/"
        POST_LOGIN_URL = "${var.app_service_portal_post_login_url}"
        POST_LOGOUT_URL = "${var.app_service_portal_post_logout_url}"
        REPLY_URL = "https://${var.azurerm_app_service_portal}.azurewebsites.net/auth/openid/return"

        # Prevent Terraform to override these values
        APPINSIGHTS_INSTRUMENTATIONKEY = ""
        TENANT_ID = ""
        ARM_SUBSCRIPTION_ID = ""
        ADMIN_API_KEY = ""
        CLIENT_ID = ""
        CLIENT_SECRET = ""
    }
}

resource "null_resource" "azurerm_app_service_portal_git" {
  triggers = {
    azurerm_app_service_portal_id = "${azurerm_app_service.azurerm_app_service_portal.id}"

    # trigger recreation of this resource when the following variables change
    app_service_portal_git_repo = "${var.app_service_portal_git_repo}"
    app_service_portal_git_branch = "${var.app_service_portal_git_branch}"

    # increment the following value when changing the provisioner script to
    # trigger the re-execution of the script
    # TODO: consider using the hash of the script content instead
    provisioner_version = "1"
  }

  provisioner "local-exec" {
    command = "ts-node ${var.website_git_provisioner} --resource-group-name ${azurerm_resource_group.azurerm_resource_group.name} --app-name ${azurerm_app_service.azurerm_app_service_portal.name} --git-repo ${var.app_service_portal_git_repo} --git-branch ${var.app_service_portal_git_branch}"
  }
}

# TODO: assign role to the MSI to let the App Service access API Management users
# resource "azurerm_virtual_machine_extension" "app_service_portal_msi" {
#     name                 = "app_service_portal_msi"
#     location            = "${azurerm_resource_group.azurerm_resource_group.location}"
#     resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
#     app_service_plan_id = "${azurerm_app_service_plan.azurerm_app_service_plan_portal.id}"
#
#     # virtual_machine_name = "${azurerm_virtual_machine.test.name}"
#
#     publisher            = "Microsoft.ManagedIdentity"
#     type                 = "ManagedIdentityExtensionForWindows"
#     type_handler_version = "1.0"
#     settings             = ""
# }
# resource "azurerm_role_assignment" "app_service_portal_role" {
#   name               = "app_service_portal_role"
#   scope              = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${var.azurerm_resource_group}/providers/Microsoft.Storage/storageAccounts/${var.azurerm_apim}"
#   role_definition_id = ""
#   principal_id       = ""
# }

## !!! API MANAGER NOT SUPPORTED

# Logging (OSM)

resource "azurerm_log_analytics_workspace" "azurerm_log_analytics" {
    name                = "${var.azurerm_log_analytics}"
    location            = "${azurerm_resource_group.azurerm_resource_group.location}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
    sku                 = "Standard"
    retention_in_days   = 30
}

# Logging (EventHub)

resource "azurerm_eventhub_namespace" "azurerm_eventhub_ns" {
    name                = "${var.azurerm_eventhub_ns}"
    location            = "${azurerm_resource_group.azurerm_resource_group.location}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
    sku                 = "Standard"
    capacity            = 1
    tags {
        environment = "${var.environment}"
    }
}

resource "azurerm_eventhub" "azurerm_apim_eventhub" {
    name                = "${var.azurerm_apim_eventhub}"
    namespace_name      = "${azurerm_eventhub_namespace.azurerm_eventhub_ns.name}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
    # EventHub Partition Count has to be between 2 and 32
    partition_count     = 2
    message_retention   = 7
}

resource "azurerm_eventhub_authorization_rule" "azurerm_apim_eventhub_rule" {
    name                = "${var.azurerm_apim_eventhub_rule}"
    namespace_name      = "${azurerm_eventhub_namespace.azurerm_eventhub_ns.name}"
    resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
    eventhub_name       = "${azurerm_eventhub.azurerm_apim_eventhub.name}"
    listen              = true
    send                = true
    manage              = false
}
