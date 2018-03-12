output "aks_rg_name" {
  value = "${local.agents_resource_group_name}"
}

output "aks_vnet_id" {
  value = "${data.azurerm_virtual_network.aks.id}"
}

output "aks_vnet_name" {
  value = "${data.azurerm_virtual_network.aks.name}"
}
