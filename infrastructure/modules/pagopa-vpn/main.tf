#
# Creates a site-to-site VPN connection
# suitable for the pagoPA test environment
#

locals {
  # Address space of the VPN virtual network
  vpn_vnet_address_space = "10.250.1.160/27"

  # Local gateway subnet (reserved for the VPN gateway resources)
  vpn_gateway_subnet = "10.250.1.160/28"

  # Default subnet (can be used for load balancers)
  vpn_default_subnet = "10.250.1.176/28"

  # Remote site subnet (remote hosts)
  vpn_site_subnet = "10.250.1.128/27"

  # IP of proxy host (inbound and outbound)
  vpn_loadbalancer_ip = "10.250.1.182"

  # On what port we expose the internal services to the external nodes
  vpn_loadbalancer_inbound_port = "80"

  # The port the AKS nodes where the CD service will listen for requests from
  # the pagoPA nodes
  aks_nodeport = "30010"

  # We need at leat VpnGw1 SKU (the Basic SKU doesn't support custom IPSec policy)
  vpn_sku = "VpnGw1"

  # Name of admin user on the loadbalancer VM
  loadbalancer_vm_admin_user = "admin-user"

  # Loadbalancer playbook repository name
  loadbalancer_playbook_repo_name = "digital-citizenship-ansible-playbooks"

  # loadbalancer playbook archive URL
  loadbalancer_playbook_url = "https://raw.githubusercontent.com/teamdigitale/${local.loadbalancer_playbook_repo_name}"

  # loadbalancer playbook archive version
  loadbalancer_playbook_version = "0.0.10"

  # Precompute resource names based on naming convention
  virtual_network_name                    = "${var.azurerm_resource_name_prefix}-ppa-vpn-vnet-${var.environment_short}"
  local_network_gateway_name              = "${var.azurerm_resource_name_prefix}-ppa-vpn-site-network-${var.environment_short}"
  public_ip_name                          = "${var.azurerm_resource_name_prefix}-ppa-vpn-public-ip-${var.environment_short}"
  virtual_network_gateway_name            = "${var.azurerm_resource_name_prefix}-ppa-vpn-gw-${var.environment_short}"
  virtual_network_gateway_connection_name = "${var.azurerm_resource_name_prefix}-ppa-vpn-conn-${var.environment_short}"
  loadbalancer_nsg_name                   = "${var.azurerm_resource_name_prefix}-ppa-lb-nsg-${var.environment_short}"
  loadbalancer_interface_name             = "${var.azurerm_resource_name_prefix}-ppa-lb-if-${var.environment_short}"
  loadbalancer_vm_name                    = "${var.azurerm_resource_name_prefix}-ppa-lb-vm-${var.environment_short}"
  loadbalancer_vm_ext_name                = "${var.azurerm_resource_name_prefix}-ppa-lb-vm-ext-${var.environment_short}"
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

resource "azurerm_subnet" "default" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                 = "default"
  resource_group_name  = "${var.resource_group_name}"
  virtual_network_name = "${azurerm_virtual_network.default.name}"
  address_prefix       = "${local.vpn_default_subnet}"
}

#
# Load balancer VM
#

resource "azurerm_network_security_group" "lb_nsg" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                = "${local.loadbalancer_nsg_name}"
  location            = "${var.resource_group_location}"
  resource_group_name = "${var.resource_group_name}"

  tags {
    environment = "${var.environment}"
  }
}

resource "azurerm_network_interface" "lb_interface" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                = "${local.loadbalancer_interface_name}"
  location            = "${var.resource_group_location}"
  resource_group_name = "${var.resource_group_name}"

  network_security_group_id = "${azurerm_network_security_group.lb_nsg.id}"

  ip_configuration {
    name                          = "staticip"
    subnet_id                     = "${azurerm_subnet.default.id}"
    private_ip_address_allocation = "static"
    private_ip_address            = "${local.vpn_loadbalancer_ip}"
  }

  tags {
    environment = "${var.environment}"
  }
}

resource "azurerm_virtual_machine" "lb_vm" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                  = "${local.loadbalancer_vm_name}"
  location              = "${var.resource_group_location}"
  resource_group_name   = "${var.resource_group_name}"
  network_interface_ids = ["${azurerm_network_interface.lb_interface.id}"]

  # This VM will be mostly idle, we can use a burstable type
  # https://docs.microsoft.com/en-us/azure/virtual-machines/linux/sizes-general#b-series
  vm_size = "Standard_B1s"

  # Uncomment this line to delete the OS disk automatically when deleting the VM
  # delete_os_disk_on_termination = true


  # Uncomment this line to delete the data disks automatically when deleting the VM
  # delete_data_disks_on_termination = true

  storage_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "16.04-LTS"
    version   = "latest"
  }
  storage_os_disk {
    name              = "osdisk1"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }
  os_profile {
    computer_name  = "lb1"
    admin_username = "${local.loadbalancer_vm_admin_user}"
  }
  os_profile_linux_config {
    disable_password_authentication = true

    ssh_keys = [
      {
        path     = "/home/${local.loadbalancer_vm_admin_user}/.ssh/authorized_keys"
        key_data = "${var.lb_ssh_key}"
      },
    ]
  }
  tags {
    environment = "${var.environment}"
  }
}

# Provision the VM by running a custom script
# Increase the value of "timestamp" for force the script to run again
resource "azurerm_virtual_machine_extension" "lb_vm_ext" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                 = "${local.loadbalancer_vm_ext_name}"
  location             = "${var.resource_group_location}"
  resource_group_name  = "${var.resource_group_name}"
  virtual_machine_name = "${azurerm_virtual_machine.lb_vm.name}"
  publisher            = "Microsoft.OSTCExtensions"
  type                 = "CustomScriptForLinux"
  type_handler_version = "1.2"

  settings = <<SETTINGS
    {
      "fileUris": ["${local.loadbalancer_playbook_url}/v${local.loadbalancer_playbook_version}/pagopa_lb_vm/run.sh"],
      "commandToExecute": "./run.sh",
      "timestamp": 1
    }
SETTINGS

  tags {
    environment = "${var.environment}"
  }
}

#
# Peerings between the VPN virtual network and the AKS virtual network
#

# Peering from the pagoPA VPN VNet to the AKS agent VNet
resource "azurerm_virtual_network_peering" "pagopa_to_aks" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                         = "PagoPaToAks"
  resource_group_name          = "${var.resource_group_name}"
  virtual_network_name         = "${azurerm_virtual_network.default.name}"
  remote_virtual_network_id    = "${var.aks_vnet_id}"
  allow_virtual_network_access = "true"

  # NOTE: due to an issue with the Azure provider, once the two mutual
  # peerings gets created, on the next run it will attempt to recreate this
  # one due to the changed (computed) value of remote_virtual_network_id
  # We can safely ignore changes to remote_virtual_network_id.
  lifecycle {
    ignore_changes = ["remote_virtual_network_id"]
  }
}

# Peering from the AKS agent VNet to the pagoPA VPN VNet
resource "azurerm_virtual_network_peering" "aks_to_pagopa" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                         = "AksToPagoPa"
  resource_group_name          = "${var.aks_rg_name}"
  virtual_network_name         = "${var.aks_vnet_name}"
  remote_virtual_network_id    = "${azurerm_virtual_network.default.id}"
  allow_virtual_network_access = "true"
}

#
# Network security rules for AKS agent nodes
#

# Allow inbound TCP from the VPN-pagoPA loadbalancer to pods:{aks_nodeport}
resource "azurerm_network_security_rule" "inbound_pagopa" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                        = "inbound_pagopa"
  priority                    = 110
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "${local.aks_nodeport}"
  source_address_prefix       = "${local.vpn_loadbalancer_ip}/32"
  destination_address_prefix  = "${var.aks_nodes_cidr}"
  resource_group_name         = "${var.aks_rg_name}"
  network_security_group_name = "${var.aks_nsg_name}"
}

# Allow outbound TCP from the aks pods to port {vpn_loadbalancer_inbound_port} of VPN-pagoPA loadbalancer
resource "azurerm_network_security_rule" "outbound_pagopa" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                        = "outbound_pagopa"
  priority                    = 110
  direction                   = "Outbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "${local.vpn_loadbalancer_inbound_port}"
  source_address_prefix       = "${var.aks_nodes_cidr}"
  destination_address_prefix  = "${local.vpn_loadbalancer_ip}/32"
  resource_group_name         = "${var.aks_rg_name}"
  network_security_group_name = "${var.aks_nsg_name}"
}

#
# Network security rules for the VPN load balancer
#

# Allow outbound TCP from the VPN-pagoPA loadbalancer to pods:{aks_nodeport}
resource "azurerm_network_security_rule" "outbound_aks" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                        = "outbound_aks"
  priority                    = 110
  direction                   = "Outbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "${local.aks_nodeport}"
  source_address_prefix       = "${local.vpn_loadbalancer_ip}/32"
  destination_address_prefix  = "${var.aks_nodes_cidr}"
  resource_group_name         = "${var.resource_group_name}"
  network_security_group_name = "${azurerm_network_security_group.lb_nsg.name}"
}

# Allow inbound TCP from the aks pods to port {vpn_loadbalancer_inbound_port} of VPN-pagoPA loadbalancer
resource "azurerm_network_security_rule" "inbound_aks" {
  # only create when enable == "true"
  count = "${var.enable == "true" ? 1 : 0}"

  name                        = "inbound_aks"
  priority                    = 110
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "${local.vpn_loadbalancer_inbound_port}"
  source_address_prefix       = "${var.aks_nodes_cidr}"
  destination_address_prefix  = "${local.vpn_loadbalancer_ip}/32"
  resource_group_name         = "${var.resource_group_name}"
  network_security_group_name = "${azurerm_network_security_group.lb_nsg.name}"
}

# TODO: add deny rules for free traffic between VNets

