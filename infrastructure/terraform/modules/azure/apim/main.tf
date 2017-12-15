
locals {
  app_service_name = "${var.organization_name}-portal-${var.environment_name_short}"
  apim_name = "${var.organization_name}-apim-${var.environment_name_short}"
  default_developer_portal_domain = "${local.apim_name}.portal.azure-api.net"
  developer_portal_domain = "${var.developer_portal_domain != "" ? var.developer_portal_domain : local.default_developer_portal_domain}"
}

#
# DEVELOPER PORTAL RESOURCES
#

resource "azurerm_app_service_plan" "app_service_plan" {
  name                = "${var.organization_name}-portal-app-${var.environment_name_short}"
  location            = "${var.location}"
  resource_group_name = "${var.resource_group_name}"

  sku {
    tier = "Standard"
    # Possible values are B1, B2, B3, D1, F1, FREE, P1, P2, P3, S1, S2, S3, SHARED
    size = "S1"
  }
}

resource "random_string" "cookie_key" {
  length = 32
}

resource "random_string" "cookie_iv" {
  length = 12
}

resource "azurerm_app_service" "app_service" {
  name                = "${local.app_service_name}"
  location            = "${var.location}"
  resource_group_name = "${var.resource_group_name}"
  app_service_plan_id = "${azurerm_app_service_plan.app_service_plan.id}"

  site_config {
    always_on = true
  }

  # Go to https://github.com/teamdigitale/digital-citizenship-onboarding
  # to see how to fill these values
  app_settings {
    POLICY_NAME = "B2C_1_SignUpIn"
    WEBSITE_NODE_DEFAULT_VERSION = "6.5.0"
    COOKIE_KEY = "${random_string.cookie_key.result}"
    COOKIE_IV = "${random_string.cookie_iv.result}"
    LOG_LEVEL = "info"
    ARM_RESOURCE_GROUP = "${var.resource_group_name}"
    ARM_APIM = "${local.apim_name}"
    APIM_PRODUCT_NAME = "starter"
    APIM_USER_GROUPS = "${var.apim_default_user_groups}"
    ADMIN_API_URL = "https://${local.apim_name}.azure-api.net/"
    POST_LOGIN_URL = "https://${local.developer_portal_domain}/developer"
    POST_LOGOUT_URL = "https://${local.developer_portal_domain}/"
    REPLY_URL = "https://${local.app_service_name}.azurewebsites.net/auth/openid/return"

    # Prevent Terraform to override these values
    APPINSIGHTS_INSTRUMENTATIONKEY = ""
    TENANT_ID = ""
    ARM_SUBSCRIPTION_ID = ""
    ADMIN_API_KEY = ""
    CLIENT_ID = ""
    CLIENT_SECRET = ""
  }
}

# TODO: assign role to the MSI to let the App Service access API Management users
# resource "azurerm_virtual_machine_extension" "app_service_portal_msi" {
#     name                 = "app_service_portal_msi"
#     location            = "${azurerm_resource_group.azurerm_resource_group.location}"
#     resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
#     app_service_plan_id = "${azurerm_app_service_plan.azurerm_app_service_plan_portal.id}"
#
#     # virtual_machine_name = "${azurerm_virtual_machine.test.name}"
#
#     publisher            = "Microsoft.ManagedIdentity"
#     type                 = "ManagedIdentityExtensionForWindows"
#     type_handler_version = "1.0"
#     settings             = ""
# }
# resource "azurerm_role_assignment" "app_service_portal_role" {
#   name               = "app_service_portal_role"
#   scope              = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${var.azurerm_resource_group}/providers/Microsoft.Storage/storageAccounts/${var.azurerm_apim}"
#   role_definition_id = ""
#   principal_id       = ""
# }
