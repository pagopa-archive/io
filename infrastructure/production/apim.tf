# API management
variable "apim_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_apim.ts"
}

variable "apim_logger_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_apim_logger.ts"
}

variable "apim_adb2c_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_apim_adb2c.ts"
}

variable "apim_api_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_apim_api.ts"
}

variable "app_service_portal_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_app_service_portal.ts"
}

variable "functionapp_apikey_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_functionapp_apikey.ts"
}

variable "apim_configuration_path" {
  default     = "common/apim.json"
  description = "Path of the (json) file that contains the configuration settings for the API management resource"
}

variable "notification_hub_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_notification_hub.ts"
}

# Notification HUB
variable "azurerm_apim_eventhub_rule" {
  type        = "string"
  description = "EventHub rule for API management"
}

variable "azurerm_notification_hub_sku" {
  type        = "string"
  description = "SKU (tier) of the Notification HUB"
}

variable "notification_hub_apns_app_id" {
  type        = "string"
  description = "APNS application Id"
}

variable "notification_hub_apns_name" {
  type        = "string"
  description = "APNS name"
}

variable "notification_hub_apns_endpoint" {
  type        = "string"
  description = "APNS endpoint (test or sandbox)"
}

variable "azurerm_apim_sku" {
  type        = "string"
  description = "SKU (tier) of the API management"
}

# TF_VAR_ADB2C_TENANT_ID
variable "ADB2C_TENANT_ID" {
  type        = "string"
  description = "Name of the Active Directory B2C tenant used in the API management portal authentication flow"
}

# TF_VAR_DEV_PORTAL_CLIENT_ID
variable "DEV_PORTAL_CLIENT_ID" {
  type        = "string"
  description = "Client ID of an application used in the API management portal authentication flow"
}

# TF_VAR_DEV_PORTAL_CLIENT_SECRET
variable "DEV_PORTAL_CLIENT_SECRET" {
  type        = "string"
  description = "Client secret of the application used in the API management portal authentication flow"
}

# TF_VAR_DEV_PORTAL_EXT_CLIENT_ID
variable "DEV_PORTAL_EXT_CLIENT_ID" {
  type        = "string"
  description = "Client ID of an application used by the digital citizenship onboarding procedure"
}

# TF_VAR_DEV_PORTAL_EXT_CLIENT_SECRET
variable "DEV_PORTAL_EXT_CLIENT_SECRET" {
  type        = "string"
  description = "Client secret of the application used by the digital citizenship onboarding procedure"
}

## Create and configure the API management service

resource "null_resource" "azurerm_apim" {
  triggers = {
    azurerm_function_app_id     = "${azurerm_function_app.azurerm_function_app.id}"
    azurerm_resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
    provisioner_version         = "1"
  }

  provisioner "local-exec" {
    command = "${join(" ", list(
      "ts-node ${var.apim_provisioner}",
      "--environment ${var.environment}",
      "--azurerm_resource_group ${azurerm_resource_group.azurerm_resource_group.name}",
      "--azurerm_apim ${local.azurerm_apim_name}",
      "--azurerm_functionapp ${azurerm_function_app.azurerm_function_app.name}",
      "--azurerm_app_service_portal ${local.azurerm_app_service_portal_name}",
      "--apim_configuration_path ${var.apim_configuration_path}"))
    }"
  }
}

## Connect API management developer portal authentication to Active Directory B2C

resource "null_resource" "azurerm_apim_adb2c" {
  triggers = {
    azurerm_function_app_id     = "${azurerm_function_app.azurerm_function_app.id}"
    azurerm_resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
    azurerm_apim_id             = "${null_resource.azurerm_apim.id}"
    provisioner_version         = "1"
  }

  depends_on = ["null_resource.azurerm_apim"]

  provisioner "local-exec" {
    command = "${join(" ", list(
      "ts-node ${var.apim_adb2c_provisioner}",
      "--environment ${var.environment}",
      "--azurerm_resource_group ${azurerm_resource_group.azurerm_resource_group.name}",
      "--azurerm_apim ${local.azurerm_apim_name}",
      "--apim_configuration_path ${var.apim_configuration_path}",
      "--adb2c_tenant_id ${var.ADB2C_TENANT_ID}",
      "--adb2c_portal_client_id ${var.DEV_PORTAL_CLIENT_ID}",
      "--adb2c_portal_client_secret ${var.DEV_PORTAL_CLIENT_SECRET}"))
    }"
  }
}

## Connect the API management resource with the EventHub logger

resource "null_resource" "azurerm_apim_logger" {
  triggers = {
    azurerm_function_app_id            = "${azurerm_function_app.azurerm_function_app.id}"
    azurerm_resource_group_name        = "${azurerm_resource_group.azurerm_resource_group.name}"
    azurerm_apim_eventhub_id           = "${azurerm_eventhub.azurerm_apim_eventhub.id}"
    azurerm_eventhub_connection_string = "${azurerm_eventhub_authorization_rule.azurerm_apim_eventhub_rule.primary_connection_string}"
    azurerm_apim_id                    = "${null_resource.azurerm_apim.id}"
    provisioner_version                = "1"
  }

  depends_on = ["null_resource.azurerm_apim"]

  provisioner "local-exec" {
    command = "${join(" ", list(
      "ts-node ${var.apim_logger_provisioner}",
      "--environment ${var.environment}",
      "--azurerm_resource_group ${azurerm_resource_group.azurerm_resource_group.name}",
      "--azurerm_apim ${local.azurerm_apim_name}",
      "--azurerm_apim_eventhub ${azurerm_eventhub.azurerm_apim_eventhub.name}",
      "--apim_configuration_path ${var.apim_configuration_path}",
      "--azurerm_apim_eventhub_connstr ${azurerm_eventhub_authorization_rule.azurerm_apim_eventhub_rule.primary_connection_string}"))
    }"
  }
}

## Setup OpenAPI in API management service from swagger specs exposed by Functions

resource "null_resource" "azurerm_apim_api" {
  triggers = {
    azurerm_function_app_id     = "${azurerm_function_app.azurerm_function_app.id}"
    azurerm_resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
    azurerm_apim_id             = "${null_resource.azurerm_apim.id}"
    provisioner_version         = "1"
  }

  depends_on = ["null_resource.azurerm_apim_logger"]

  provisioner "local-exec" {
    command = "${join(" ", list(
      "ts-node ${var.apim_api_provisioner}",
      "--environment ${var.environment}",
      "--azurerm_resource_group ${azurerm_resource_group.azurerm_resource_group.name}",
      "--azurerm_apim ${local.azurerm_apim_name}",
      "--azurerm_functionapp ${azurerm_function_app.azurerm_function_app.name}",
      "--apim_configuration_path ${var.apim_configuration_path}",
      "--apim_include_policies",
      "--apim_include_products"))
    }"
  }
}
