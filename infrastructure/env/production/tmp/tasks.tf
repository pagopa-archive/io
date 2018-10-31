### DEVELOPER PORTAL TASKS

variable "azurerm_adb2c_policy" {
  type        = "string"
  description = "Name of ADB2C policy used in the API management portal authentication flow"
}

variable "app_service_portal_git_repo" {
  type        = "string"
  description = "URL of the GitHub repository providing the source of the App Service Portal"
}

variable "app_service_portal_git_branch" {
  default     = "master"
  description = "Branch of the GitHub repository providing the source of the App Service Portal"
}

variable "app_service_portal_post_login_url" {
  type        = "string"
  description = "Redirect to this page after developer portal login"
}

variable "app_service_portal_post_logout_url" {
  type        = "string"
  description = "Redirect to this page after developer portal logout"
}

variable "azurerm_shared_address_space_cidr" {
  default     = "100.64.0.0/10"
  description = "Azure internal network CIDR"
}

# see https://docs.microsoft.com/en-us/azure/cosmos-db/firewall-support
variable "azurerm_azure_portal_ips" {
  default     = "104.42.195.92,40.76.54.131,52.176.6.30,52.169.50.45,52.187.184.26"
  description = "The IPs of the Azure admin portal"
}

resource "azurerm_app_service_plan" "azurerm_app_service_plan_portal" {
  name                = "${local.azurerm_app_service_plan_portal_name}"
  location            = "${azurerm_resource_group.azurerm_resource_group.location}"
  resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"

  sku {
    tier = "Standard"

    # see https://azure.microsoft.com/en-en/pricing/details/app-service/
    size = "S1"
  }
}

resource "random_string" "cookie_key" {
  length = 32
}

resource "random_string" "cookie_iv" {
  length = 12
}

resource "azurerm_app_service" "azurerm_app_service_portal" {
  name                = "${local.azurerm_app_service_portal_name}"
  location            = "${azurerm_resource_group.azurerm_resource_group.location}"
  resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
  app_service_plan_id = "${azurerm_app_service_plan.azurerm_app_service_plan_portal.id}"

  site_config {
    always_on = true
  }

  # Go to https://github.com/teamdigitale/digital-citizenship-onboarding
  # to see how to fill these values
  app_settings {
    POLICY_NAME                  = "${var.azurerm_adb2c_policy}"
    WEBSITE_NODE_DEFAULT_VERSION = "6.5.0"
    COOKIE_KEY                   = "${random_string.cookie_key.result}"
    COOKIE_IV                    = "${random_string.cookie_iv.result}"
    LOG_LEVEL                    = "info"
    ARM_RESOURCE_GROUP           = "${azurerm_resource_group.azurerm_resource_group.name}"
    ARM_APIM                     = "${local.azurerm_apim_name}"
    APIM_PRODUCT_NAME            = "starter"
    APIM_USER_GROUPS             = "ApiLimitedMessageWrite,ApiInfoRead,ApiMessageRead,ApiLimitedProfileRead"
    ADMIN_API_URL                = "https://${local.azurerm_apim_name}.azure-api.net/"
    POST_LOGIN_URL               = "${var.app_service_portal_post_login_url}"
    POST_LOGOUT_URL              = "${var.app_service_portal_post_logout_url}"
    REPLY_URL                    = "https://${local.azurerm_app_service_portal_name}.azurewebsites.net/auth/openid/return"

    ARM_SUBSCRIPTION_ID = "${data.azurerm_client_config.current.subscription_id}"
    TENANT_ID           = "${var.ADB2C_TENANT_ID}"
    CLIENT_ID           = "${var.DEV_PORTAL_EXT_CLIENT_ID}"
    CLIENT_SECRET       = "${var.DEV_PORTAL_EXT_CLIENT_SECRET}"

    # Prevent Terraform to override these values
    APPINSIGHTS_INSTRUMENTATIONKEY = ""
    ADMIN_API_KEY                  = ""
  }
}

# Creates a new administrator user and setup the API-Key (of this user)
# in the developer portal onboarding web application,
# see https://github.com/teamdigitale/digital-citizenship-onboarding
resource "null_resource" "azurerm_app_service_portal" {
  triggers = {
    azurerm_app_service_portal_id = "${azurerm_app_service.azurerm_app_service_portal.id}"
    provisioner_version           = "1"
  }

  depends_on = ["null_resource.azurerm_apim", "azurerm_function_app.azurerm_function_app", "azurerm_app_service.azurerm_app_service_portal"]

  provisioner "local-exec" {
    command = "${join(" ", list(
      "ts-node ${var.app_service_portal_provisioner}",
      "--environment ${var.environment}",
      "--azurerm_resource_group ${azurerm_resource_group.azurerm_resource_group.name}",
      "--azurerm_apim ${local.azurerm_apim_name}",
      "--apim_configuration_path ${var.apim_configuration_path}",
      "--azurerm_app_service_portal ${azurerm_app_service.azurerm_app_service_portal.name}",
      "--azurerm_cosmosdb ${azurerm_cosmosdb_account.azurerm_cosmosdb.name}",
      "--azurerm_documentdb ${local.azurerm_cosmosdb_documentdb_name}",
      "--azurerm_cosmosdb_key ${azurerm_cosmosdb_account.azurerm_cosmosdb.primary_master_key}"))
    }"
  }
}

resource "null_resource" "azurerm_app_service_portal_git" {
  triggers = {
    azurerm_app_service_portal_id = "${azurerm_app_service.azurerm_app_service_portal.id}"

    # trigger recreation of this resource when the following variables change
    app_service_portal_git_repo   = "${var.app_service_portal_git_repo}"
    app_service_portal_git_branch = "${var.app_service_portal_git_branch}"

    # increment the following value when changing the provisioner script to
    # trigger the re-execution of the script
    # TODO: consider using the hash of the script content instead
    provisioner_version = "1"
  }

  provisioner "local-exec" {
    command = "ts-node ${var.website_git_provisioner} --resource-group-name ${azurerm_resource_group.azurerm_resource_group.name} --app-name ${azurerm_app_service.azurerm_app_service_portal.name} --git-repo ${var.app_service_portal_git_repo} --git-branch ${var.app_service_portal_git_branch}"
  }
}

locals {
  application_outbound_ips = "${var.azurerm_shared_address_space_cidr},${azurerm_function_app.azurerm_function_app.outbound_ip_addresses},${azurerm_app_service.azurerm_app_service_portal.outbound_ip_addresses},${var.azurerm_azure_portal_ips}"
}

resource "null_resource" "azurerm_cosmosdb_ip_range_filter" {
  triggers = {
    cosmosdb_id              = "${azurerm_cosmosdb_account.azurerm_cosmosdb.id}"
    application_outbound_ips = "${local.application_outbound_ips}"

    # increment the following value when changing the provisioner script to
    # trigger the re-execution of the script
    # TODO: consider using the hash of the script content instead
    provisioner_version = "1"
  }

  provisioner "local-exec" {
    command = "ts-node ${var.cosmosdb_iprange_provisioner} --resource-group-name ${azurerm_resource_group.azurerm_resource_group.name} --cosmosdb-name ${azurerm_cosmosdb_account.azurerm_cosmosdb.name} --ips ${local.application_outbound_ips}"
  }
}
