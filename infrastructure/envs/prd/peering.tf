# Peering from the AKS agent VNet to the Redis Cache VNet
resource "azurerm_virtual_network_peering" "aks_to_redis" {
  name                         = "AksToRedis"
  resource_group_name          = "${module.kubernetes.aks_rg_name}"
  virtual_network_name         = "${module.kubernetes.aks_vnet_name}"
  remote_virtual_network_id    = "${azurerm_virtual_network.azurerm_redis_cache.id}"
  allow_virtual_network_access = "true"
}
