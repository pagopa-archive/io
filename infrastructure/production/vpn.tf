# PagoPA VPN
# Currently enabled only for test environment
#
# WARNING: see note in the module source about associating AKS agents to the
# backend pool.
#

module "pagopa_vpn" {
  source = "./modules/pagopa-vpn"

  # This resource must exist only in the "test" environment
  enable = "${var.environment == "test" ? "true" : "false"}"

  environment                  = "${var.environment}"
  azurerm_resource_name_prefix = "${var.azurerm_resource_name_prefix}"
  environment_short            = "${var.environment_short}"
  resource_group_location      = "${azurerm_resource_group.azurerm_resource_group.location}"
  resource_group_name          = "${azurerm_resource_group.azurerm_resource_group.name}"
  site_gateway_address         = "${var.pagopa_vpn_site_gateway_ip}"
  vpn_shared_key               = "${var.pagopa_vpn_shared_key}"
  aks_rg_name                  = "${module.kubernetes.aks_rg_name}"
  aks_vnet_id                  = "${module.kubernetes.aks_vnet_id}"
  aks_vnet_name                = "${module.kubernetes.aks_vnet_name}"
  aks_nsg_name                 = "${module.kubernetes.aks_nsg_name}"
  aks_nodes_cidr               = "${module.kubernetes.aks_nodes_cidr}"
  lb_ssh_key                   = "${local.azurerm_kubernetes_admin_ssh_publickey}"
}

output "pagopa_vpn_public_ip_ip" {
  value = "${module.pagopa_vpn.vpn_gateway_public_ip}"
}
