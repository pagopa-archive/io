## APPLICATION INSIGHTS

resource "azurerm_application_insights" "azurerm_application_insights" {
  name                = "${local.azurerm_application_insights_name}"
  location            = "${azurerm_resource_group.azurerm_resource_group.location}"
  resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"

  # Web or Other
  application_type = "Web"
}
