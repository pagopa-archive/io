# Azure Container Service (Kubernetes)
#
locals {
  # The ssh public key for the admin account on the k8s nodes is read from the
  # file stored in the "files" directory and named after the value of the
  # variable "azurerm_kubernetes_admin_ssh_publickey_file"
  azurerm_kubernetes_admin_ssh_publickey = "${file("${path.module}/files/${var.azurerm_kubernetes_admin_ssh_publickey_file}")}"
}

module "kubernetes" {
  source = "./modules/azurerm/kubernetes"

  environment                     = "${var.environment}"
  resource_group_location         = "${azurerm_resource_group.azurerm_resource_group.location}"
  resource_group_name             = "${azurerm_resource_group.azurerm_resource_group.name}"
  name                            = "${local.azurerm_kubernetes_name}"
  admin_username                  = "${var.azurerm_kubernetes_admin_username}"
  admin_ssh_publickey             = "${local.azurerm_kubernetes_admin_ssh_publickey}"
  agent_count                     = "${var.azurerm_kubernetes_agent_count}"
  agent_vm_size                   = "${var.azurerm_kubernetes_agent_vm_size}"
  service_principal_client_id     = "${data.azurerm_client_config.current.client_id}"
  service_principal_client_secret = "${var.ARM_CLIENT_SECRET}"
}

#
# Allocates a public IP for exposing the Kubernetes services
#
# This IP needs to be registered on the following CNAMEs:
#
# *.k8s.test.cd.teamdigitale.it (for the test environment)
# *.k8s.prod.cd.teamdigitale.it (for the production environment)
#

resource "azurerm_public_ip" "azurerm_kubernetes_public_ip" {
  name                         = "${local.azurerm_kubernetes_public_ip_name}"
  location                     = "${azurerm_resource_group.azurerm_resource_group.location}"
  resource_group_name          = "${azurerm_resource_group.azurerm_resource_group.name}"
  public_ip_address_allocation = "static"

  tags {
    environment = "${var.environment}"
  }
}

output "azurerm_kubernetes_public_ip_ip" {
  value = "${azurerm_public_ip.azurerm_kubernetes_public_ip.ip_address}"
}