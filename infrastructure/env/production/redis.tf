# Redis cache
#
resource "azurerm_storage_account" "azurerm_redis_backup" {
  name                = "${local.azurerm_redis_backup_name}"
  resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
  location            = "${azurerm_resource_group.azurerm_resource_group.location}"

  # see https://docs.microsoft.com/en-us/azure/storage/common/storage-introduction#types-of-storage-accounts
  account_tier = "Standard"

  # see https://docs.microsoft.com/en-us/azure/storage/common/storage-introduction#replication
  account_replication_type  = "ZRS"
  enable_blob_encryption    = true
  enable_https_traffic_only = true
}

resource "azurerm_redis_cache" "azurerm_redis_cache" {
  name                = "${local.azurerm_redis_cache_name}"
  location            = "${azurerm_resource_group.azurerm_resource_group.location}"
  resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"

  # Possible values for Premium: n=1=6GB, 2=13Gb, 3=26GB, 4=53GB
  capacity = 1

  # Total capacity is shard_count * capacity in GB
  shard_count = 1

  enable_non_ssl_port = false

  # see https://docs.microsoft.com/en-us/azure/redis-cache/cache-faq#what-redis-cache-offering-and-size-should-i-use
  # and https://www.terraform.io/docs/providers/azurerm/r/redis_cache.html#default-redis-configuration-values
  #
  # default values are:
  #   maxmemory_reserved = 200
  #   maxmemory_delta    = 200
  #   maxmemory_policy   = "volatile-lru"
  #
  redis_configuration {
    # Values are: 15, 30, 60, 360, 720 and 1440 seconds
    rdb_backup_frequency          = 360
    rdb_backup_max_snapshot_count = 1
    rdb_backup_enabled            = true

    rdb_storage_connection_string = "${azurerm_storage_account.azurerm_redis_backup.primary_connection_string}"
  }

  #  subnet_id = "${data.azurerm_subnet.azurerm_redis_cache.id}"
  # must be inside azurerm_virtual_network.azurerm_redis_cache address space
  #  private_static_ip_address = "10.230.0.10"

  # At the moment we need Premium tier even
  # in the test environment to support clustering
  family = "P"

  sku_name = "Premium"

  tags {
    environment = "${var.environment}"
  }
}
