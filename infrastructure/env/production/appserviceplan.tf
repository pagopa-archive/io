## APP SERVICE PLAN


resource "azurerm_app_service_plan" "azurerm_app_service_plan" {
  name                = "${local.azurerm_app_service_plan_name}"
  location            = "${azurerm_resource_group.azurerm_resource_group.location}"
  resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"

  sku {
    tier = "Standard"

    # see https://azure.microsoft.com/en-en/pricing/details/app-service/
    size = "S1"
  }
}
