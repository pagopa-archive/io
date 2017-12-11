# TODO: verify that master_count is 3 or 5

resource "azurerm_container_service" "azurerm_container_service" {
  name                   = "${var.name}"
  location               = "${var.resource_group_location}"
  resource_group_name    = "${var.resource_group_name}"
  orchestration_platform = "Kubernetes"

  master_profile {
    count      = "${var.master_count}" // 3 or 5 for HA
    dns_prefix = "${var.name}-master"
  }

  linux_profile {
    admin_username = "${var.admin_username}"

    ssh_key {
      key_data = "${var.admin_ssh_publickey}"
    }
  }

  agent_pool_profile {
    name       = "default"
    count      = "${var.agent_count}"
    dns_prefix = "${var.name}-agent"
    vm_size    = "${var.agent_vm_size}"
  }

  service_principal {
    client_id     = "${var.service_principal_client_id}"
    client_secret = "${var.service_principal_client_secret}"
  }

  diagnostics_profile {
    enabled = false
  }

  tags {
    environment = "${var.environment}"
  }
}

resource "azurerm_public_ip" "azurerm_public_ip_container_service" {
  name                         = "${var.name}-publicip"
  location                     = "${var.resource_group_location}"
  resource_group_name          = "${var.resource_group_name}"
  public_ip_address_allocation = "static"

  # reverse_fqdn

  tags {
    environment = "${var.environment}"
  }
}
