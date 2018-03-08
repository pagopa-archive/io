#
# Creates a site-to-site VPN connection
# suitable for the pagoPA test environment
#

locals {
  # Address space of the VPN virtual network
  vpn_vnet_address_space = "10.250.1.160/27"

  # Local gateway subnet (reserved for the VPN gateway resources)
  vpn_gateway_subnet = "10.250.1.160/28"

  # Remote site subnet (remote hosts)
  vpn_site_subnet = "10.250.1.128/27"

  # We need at leat VpnGw1 SKU (the Basic SKU doesn't support custom IPSec policy)
  vpn_sku                                 = "VpnGw1"
  virtual_network_name                    = "${var.azurerm_resource_name_prefix}-ppa-vpn-vnet-${var.environment_short}"
  local_network_gateway_name              = "${var.azurerm_resource_name_prefix}-ppa-vpn-site-network-${var.environment_short}"
  public_ip_name                          = "${var.azurerm_resource_name_prefix}-ppa-vpn-public-ip-${var.environment_short}"
  virtual_network_gateway_name            = "${var.azurerm_resource_name_prefix}-ppa-vpn-gw-${var.environment_short}"
  virtual_network_gateway_connection_name = "${var.azurerm_resource_name_prefix}-ppa-vpn-conn-${var.environment_short}"
}

resource "azurerm_virtual_network" "default" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                = "${local.virtual_network_name}"
  location            = "${var.resource_group_location}"
  resource_group_name = "${var.resource_group_name}"
  address_space       = ["${local.vpn_vnet_address_space}"]

  tags {
    environment = "${var.environment}"
  }
}

#
# VPN configuration
#

resource "azurerm_subnet" "gateway" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  # The name of this subnet must be "GatewaySubnet"
  name                 = "GatewaySubnet"
  resource_group_name  = "${var.resource_group_name}"
  virtual_network_name = "${azurerm_virtual_network.default.name}"
  address_prefix       = "${local.vpn_gateway_subnet}"
}

resource "azurerm_local_network_gateway" "default" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                = "${local.local_network_gateway_name}"
  location            = "${var.resource_group_location}"
  resource_group_name = "${var.resource_group_name}"
  gateway_address     = "${var.site_gateway_address}"
  address_space       = ["${local.vpn_site_subnet}"]

  tags {
    environment = "${var.environment}"
  }
}

resource "azurerm_public_ip" "default" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                         = "${local.public_ip_name}"
  location                     = "${var.resource_group_location}"
  resource_group_name          = "${var.resource_group_name}"
  public_ip_address_allocation = "Dynamic"

  tags {
    environment = "${var.environment}"
  }
}

resource "azurerm_virtual_network_gateway" "default" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                = "${local.virtual_network_gateway_name}"
  location            = "${var.resource_group_location}"
  resource_group_name = "${var.resource_group_name}"

  type     = "Vpn"
  vpn_type = "RouteBased"

  active_active = false
  enable_bgp    = false
  sku           = "${local.vpn_sku}"

  ip_configuration {
    public_ip_address_id          = "${azurerm_public_ip.default.id}"
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = "${azurerm_subnet.gateway.id}"
  }

  tags {
    environment = "${var.environment}"
  }
}

resource "azurerm_virtual_network_gateway_connection" "default" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                = "${local.virtual_network_gateway_connection_name}"
  location            = "${var.resource_group_location}"
  resource_group_name = "${var.resource_group_name}"

  type                       = "IPsec"
  virtual_network_gateway_id = "${azurerm_virtual_network_gateway.default.id}"
  local_network_gateway_id   = "${azurerm_local_network_gateway.default.id}"

  shared_key = "${var.vpn_shared_key}"

  ipsec_policy {
    dh_group         = "DHGroup2"
    ike_encryption   = "AES256"
    ike_integrity    = "SHA256"
    ipsec_encryption = "AES256"
    ipsec_integrity  = "SHA256"
    pfs_group        = "None"
    sa_lifetime      = "86400"
  }

  tags {
    environment = "${var.environment}"
  }
}
