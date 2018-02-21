#
# Kubernetes cluster
#
resource "azurerm_kubernetes_cluster" "azurerm_kubernetes_cluster" {
  name                   = "${var.name}"
  location               = "${var.resource_group_location}"
  resource_group_name    = "${var.resource_group_name}"
  dns_prefix             = "${var.name}"

  # see https://docs.microsoft.com/en-us/cli/azure/aks?view=azure-cli-latest#az_aks_create
  kubernetes_version     = "1.8.7"

  linux_profile {
    admin_username = "${var.admin_username}"

    ssh_key {
      key_data = "${var.admin_ssh_publickey}"
    }
  }

  agent_pool_profile {
    name       = "default"
    count      = "${var.agent_count}"
    vm_size    = "${var.agent_vm_size}"
  }

  service_principal {
    client_id     = "${var.service_principal_client_id}"
    client_secret = "${var.service_principal_client_secret}"
  }

  tags {
    environment = "${var.environment}"
  }
}
