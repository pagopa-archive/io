#
# Kubernetes cluster
#

resource "azurerm_kubernetes_cluster" "azurerm_kubernetes_cluster" {
  name                = "${var.name}"
  location            = "${var.resource_group_location}" # West Europe
  resource_group_name = "${var.resource_group_name}"
  dns_prefix          = "${var.name}"

  # see https://docs.microsoft.com/en-us/cli/azure/aks?view=azure-cli-latest#az_aks_create
  kubernetes_version = "1.8.7"

  linux_profile {
    admin_username = "${var.admin_username}"

    ssh_key {
      key_data = "${var.admin_ssh_publickey}"
    }
  }

  agent_pool_profile {
    name    = "default"
    count   = "${var.agent_count}"
    vm_size = "${var.agent_vm_size}"
  }

  service_principal {
    client_id     = "${var.service_principal_client_id}"
    client_secret = "${var.service_principal_client_secret}"
  }

  tags {
    environment = "${var.environment}"
  }
}

locals {
  # This ID gets used by AKS to name resources, there's no current way of
  # reading this value.
  # TODO: find a way to look this up
  aks_id = "27508996"

  # The agents get created in a dedicated resource group that gets automatically
  # provisioned by Azure, there's currently no way to get the name of this
  # resource group, thus we need to manually compute its name.
  agents_resource_group_name = "MC_${var.resource_group_name}_${var.name}_${replace(lower(var.resource_group_location), " ", "")}"

  # The name of the network security group created by AKS
  agents_network_security_group_name = "aks-agentpool-${local.aks_id}-nsg"

  # The CIDR for the AKS agent nodes
  agent_nodes_cidr = "10.240.0.0/16"
}

data "azurerm_virtual_network" "aks" {
  name                = "aks-vnet-${local.aks_id}"
  resource_group_name = "${local.agents_resource_group_name}"
  depends_on          = ["azurerm_kubernetes_cluster.azurerm_kubernetes_cluster"]
}
