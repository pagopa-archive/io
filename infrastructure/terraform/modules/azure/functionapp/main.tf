
#
# A dedicated storage account for Azure function apps
#

resource "azurerm_storage_account" "storage_account" {
  name                = "${var.organization_name}funcstorage${var.environment_name_short}"
  resource_group_name = "${var.resource_group_name}"
  location            = "${var.location}"

  # can be one between Premium_LRS, Standard_GRS, Standard_LRS, Standard_RAGRS, Standard_ZRS
  # see https://docs.microsoft.com/en-us/azure/storage/common/storage-redundancy
  account_tier             = "Standard"
  account_replication_type = "GRS"

  # see https://docs.microsoft.com/en-us/azure/storage/common/storage-service-encryption
  enable_blob_encryption = true

  tags {
    environment = "${var.environment_name}"
  }
}

#
# QUEUES
#

resource "azurerm_storage_queue" "storage_queue" {
  count                = "${length(var.storage_queue_names)}"
  name                 = "${element(var.storage_queue_names, count.index)}"
  resource_group_name  = "${var.resource_group_name}"
  storage_account_name = "${azurerm_storage_account.storage_account.name}"
}

#
# DATABASE
#

resource "azurerm_cosmosdb_account" "cosmosdb" {
  name                = "${var.organization_name}-cosmosdb-${var.environment_name_short}"
  location            = "${var.location}"
  resource_group_name = "${var.resource_group_name}"

  # Possible values are GlobalDocumentDB and MongoDB
  kind = "GlobalDocumentDB"

  # Required - can be only set to Standard
  offer_type = "Standard"

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
    environment = "${var.environment_name}"
  }

  ## !!! DATABASE AND COLLECTIONS ARE NOT SUPPORTED: we create them manually
  # provisioner "local-exec" {
  #   command = "ts-node ./tasks/cosmosdb.ts"
  # }
}

#
# APPLICATION INSIGHTS
#

resource "azurerm_application_insights" "application_insights" {
  name                = "${var.organization_name}-appinsights-${var.environment_name_short}"
  location            = "${var.location}"
  resource_group_name = "${var.resource_group_name}"
  # Web or Other
  application_type    = "Web"

  tags {
    environment = "${var.environment_name}"
  }
}

#
# APP SERVICE PLAN
#

resource "azurerm_app_service_plan" "app_service_plan" {
  name                = "${var.organization_name}-app-${var.environment_name_short}"
  location            = "${var.location}"
  resource_group_name = "${var.resource_group_name}"

  sku {
    tier = "Standard"
    # Possible values are B1, B2, B3, D1, F1, FREE, P1, P2, P3, S1, S2, S3, SHARED
    size = "S1"
  }

  ## !!! FUNCTIONS APP ARE NOT SUPPORTED: we create them manually
  # provisioner "local-exec" {
  #    command = "ts-node ./tasks/functions.ts"
  # }

  tags {
    environment = "${var.environment_name}"
  }
}
