#
# RESOURCE GROUP
#

resource "azurerm_resource_group" "common_resource_group" {
  name     = "${var.organization_name}-rg-${var.environment_name_short}"
  location = "${var.location}"
  tags {
    environment = "${var.environment_name}"
  }
}

#
# STORAGE ACCOUNT
#

resource "azurerm_storage_account" "common_storage_account" {
  name                = "${var.organization_name}storage${var.environment_name_short}"
  resource_group_name = "${azurerm_resource_group.common_resource_group.name}"
  location            = "${azurerm_resource_group.common_resource_group.location}"

  # can be one between Premium_LRS, Standard_GRS, Standard_LRS, Standard_RAGRS, Standard_ZRS
  # see https://docs.microsoft.com/en-us/azure/storage/common/storage-redundancy
  account_tier             = "Standard"
  account_replication_type = "GRS"

  # see https://docs.microsoft.com/en-us/azure/storage/common/storage-service-encryption
  enable_blob_encryption = true

  tags {
    environment = "${var.environment_name}"
  }
}
