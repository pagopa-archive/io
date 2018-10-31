## DATABASE

resource "azurerm_cosmosdb_account" "azurerm_cosmosdb" {
  name                = "${local.azurerm_cosmosdb_name}"
  location            = "${azurerm_resource_group.azurerm_resource_group.location}"
  resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"

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

  geo_location {
    location          = "${var.cosmosdb_failover_location}"
    failover_priority = 0
  }

  # ip_range_filter = "${azurerm_function_app.azurerm_function_app.outbound_ip_addresses}"

  tags {
    environment = "${var.environment}"
  }
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
    command = "${join(" ", list(
      "ts-node ${var.cosmosdb_collection_provisioner}",
      "--azurerm_resource_group ${azurerm_resource_group.azurerm_resource_group.name}",
      "--azurerm_cosmosdb ${azurerm_cosmosdb_account.azurerm_cosmosdb.name}",
      "--azurerm_documentdb ${local.azurerm_cosmosdb_documentdb_name}",
      "--azurerm_cosmosdb_collection ${element(keys(var.azurerm_cosmosdb_collections), count.index)}",
      "--azurerm_cosmosdb_collection_pk ${lookup(var.azurerm_cosmosdb_collections, element(keys(var.azurerm_cosmosdb_collections), count.index))}",
      "--azurerm_cosmosdb_key ${azurerm_cosmosdb_account.azurerm_cosmosdb.primary_master_key}"))
    }"
  }
}
