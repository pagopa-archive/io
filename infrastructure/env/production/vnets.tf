# Virtual network needed to deploy redis cache
resource "azurerm_virtual_network" "azurerm_redis_cache" {
  name                = "${local.azurerm_redis_vnet_name}"
  location            = "${azurerm_resource_group.azurerm_resource_group.location}"
  resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
  address_space       = ["172.16.0.0/16"]

  tags {
    environment = "${var.environment}"
  }
}


resource "azurerm_subnet" "azurerm_redis_cache" {
  name                 = "default"
  virtual_network_name = "${local.azurerm_redis_vnet_name}"
  resource_group_name  = "${azurerm_resource_group.azurerm_resource_group.name}"
  address_prefix       = "172.16.0.0/24"
}


# Peering from the Redis Cache VNet to the AKS agent VNet
resource "azurerm_virtual_network_peering" "redis_to_aks" {
  name                         = "RedisToAks"
  resource_group_name          = "${azurerm_resource_group.azurerm_resource_group.name}"
  virtual_network_name         = "${azurerm_virtual_network.azurerm_redis_cache.name}"
  remote_virtual_network_id    = "${module.kubernetes.aks_vnet_id}"
  allow_virtual_network_access = "true"

  # NOTE: due to an issue with the Azure provider, once the two mutual
  # peerings gets created, on the next run it will attempt to recreate this
  # one due to the changed (computed) value of remote_virtual_network_id
  # We can safely ignore changes to remote_virtual_network_id.
  lifecycle {
    ignore_changes = ["remote_virtual_network_id"]
  }
}
