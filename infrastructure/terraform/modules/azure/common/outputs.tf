
output "resource_group_name" {
  value = "${azurerm_resource_group.common_resource_group.name}"
}

output "storage_account_name" {
  value = "${azurerm_storage_account.common_storage_account.name}"
}
