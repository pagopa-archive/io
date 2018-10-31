## BLOBS

resource "azurerm_storage_blob" "azurerm_message_blob" {
  name = "${var.message_blob_container}"

  resource_group_name    = "${azurerm_resource_group.azurerm_resource_group.name}"
  storage_account_name   = "${azurerm_storage_account.azurerm_storage_account.name}"
  storage_container_name = "${azurerm_storage_container.azurerm_storage_container.name}"

  type = "block"
}
