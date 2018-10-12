## QUEUES

resource "azurerm_storage_queue" "azurerm_storage_queue_emailnotifications" {
  name                 = "${var.azurerm_storage_queue_emailnotifications}"
  resource_group_name  = "${azurerm_resource_group.azurerm_resource_group.name}"
  storage_account_name = "${azurerm_storage_account.azurerm_storage_account.name}"
}

resource "azurerm_storage_queue" "azurerm_storage_queue_webhooknotifications" {
  name                 = "${var.azurerm_storage_queue_webhooknotifications}"
  resource_group_name  = "${azurerm_resource_group.azurerm_resource_group.name}"
  storage_account_name = "${azurerm_storage_account.azurerm_storage_account.name}"
}

resource "azurerm_storage_queue" "azurerm_storage_queue_createdmessages" {
  name                 = "${var.azurerm_storage_queue_createdmessages}"
  resource_group_name  = "${azurerm_resource_group.azurerm_resource_group.name}"
  storage_account_name = "${azurerm_storage_account.azurerm_storage_account.name}"
}

resource "azurerm_storage_queue" "azurerm_storage_queue_profileevents" {
  name                 = "${var.azurerm_storage_queue_profileevents}"
  resource_group_name  = "${azurerm_resource_group.azurerm_resource_group.name}"
  storage_account_name = "${azurerm_storage_account.azurerm_storage_account.name}"
}
