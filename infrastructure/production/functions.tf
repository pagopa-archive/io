## FUNCTIONS
variable "azurerm_functionapp_git_repo" {
  default     = "https://github.com/teamdigitale/digital-citizenship-functions"
  description = "The GitHub repository that must be associated to the function app"
}

variable "azurerm_functionapp_git_branch" {
  default     = "funcpack-release-latest"
  description = "The branch of the GitHub repository that must be associated to the function app"
}

variable "webhook_channel_url" {
  type        = "string"
  description = "URL to contact when sending notifications to the webhook (without the secret token)"
}

# TF_VAR_WEBHOOK_CHANNEL_URL_TOKEN
variable "WEBHOOK_CHANNEL_URL_TOKEN" {
  type        = "string"
  description = "Secret token that is appended to the webhook_channel_url"
}

# This should be passed by ENV var TF_VAR_MAILUP_USERNAME
variable "MAILUP_USERNAME" {
  type        = "string"
  description = "Username for the MailUp SMTP+ service"
}

# This should be passed by ENV var TF_VAR_MAILUP_SECRET
variable "MAILUP_SECRET" {
  type        = "string"
  description = "Password for the MailUp SMTP+ service"
}

variable "default_sender_email" {
  type        = "string"
  description = "Default sender email address"
}

variable "website_git_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_website_git.ts"
}

resource "azurerm_function_app" "azurerm_function_app" {
  name                      = "${local.azurerm_functionapp_name}"
  location                  = "${azurerm_resource_group.azurerm_resource_group.location}"
  resource_group_name       = "${azurerm_resource_group.azurerm_resource_group.name}"
  app_service_plan_id       = "${azurerm_app_service_plan.azurerm_app_service_plan.id}"
  storage_connection_string = "${azurerm_storage_account.azurerm_functionapp_storage_account.primary_connection_string}"
  client_affinity_enabled   = false
  version                   = "~1"

  site_config = {
    # We don't want the express server to idle
    # so do not set `alwaysOn: false` in production
    always_on = true
  }

  # Do not set "AzureWebJobsDashboard" to disable builtin logging
  # see https://docs.microsoft.com/en-us/azure/azure-functions/functions-monitoring#disable-built-in-logging

  app_settings = {
    # "AzureWebJobsStorage" = "${azurerm_storage_account.azurerm_functionapp_storage_account.primary_connection_string}"

    "COSMOSDB_NAME" = "${local.azurerm_cosmosdb_documentdb_name}"

    "QueueStorageConnection" = "${azurerm_storage_account.azurerm_storage_account.primary_connection_string}"

    "APPINSIGHTS_INSTRUMENTATIONKEY" = "${azurerm_application_insights.azurerm_application_insights.instrumentation_key}"

    # Avoid edit functions code from the Azure portal
    "FUNCTION_APP_EDIT_MODE" = "readonly"

    # AzureWebJobsSecretStorageType may be `disabled` or `Blob`
    # When set to `Blob` the API manager task won't be able
    # to retrieve the master key
    "AzureWebJobsSecretStorageType" = "disabled"

    "WEBSITE_HTTPLOGGING_RETENTION_DAYS" = "3"

    "DIAGNOSTICS_AZUREBLOBRETENTIONINDAYS" = "1"

    "WEBSITE_NODE_DEFAULT_VERSION" = "6.11.2"

    "SCM_USE_FUNCPACK_BUILD" = "1"

    "MESSAGE_CONTAINER_NAME" = "${azurerm_storage_blob.azurerm_message_blob.name}"

    "MAILUP_USERNAME" = "${var.MAILUP_USERNAME}"

    "MAILUP_SECRET" = "${var.MAILUP_SECRET}"

    "MAIL_FROM_DEFAULT" = "${var.default_sender_email}"

    "WEBHOOK_CHANNEL_URL" = "${var.webhook_channel_url}${var.WEBHOOK_CHANNEL_URL_TOKEN}"

    "PUBLIC_API_URL" = "https://${local.azurerm_apim_name}.azure-api.net/"

    # API management API-Key (Ocp-Apim-Subscription-Key)
    # set the value manually or with a local provisioner
    "PUBLIC_API_KEY" = ""
  }
  connection_string = [
    {
      name  = "COSMOSDB_KEY"
      type  = "Custom"
      value = "${azurerm_cosmosdb_account.azurerm_cosmosdb.primary_master_key}"
    },
    {
      name  = "COSMOSDB_URI"
      type  = "Custom"
      value = "https://${azurerm_cosmosdb_account.azurerm_cosmosdb.name}.documents.azure.com:443/"
    },
  ]
}

resource "null_resource" "azurerm_function_app_git" {
  triggers = {
    azurerm_functionapp_id = "${azurerm_function_app.azurerm_function_app.id}"

    # trigger recreation of this resource when the following variables change
    azurerm_functionapp_git_repo   = "${var.azurerm_functionapp_git_repo}"
    azurerm_functionapp_git_branch = "${var.azurerm_functionapp_git_branch}"

    # increment the following value when changing the provisioner script to
    # trigger the re-execution of the script
    # TODO: consider using the hash of the script content instead
    provisioner_version = "1"
  }

  provisioner "local-exec" {
    command = "ts-node ${var.website_git_provisioner} --resource-group-name ${azurerm_resource_group.azurerm_resource_group.name} --app-name ${azurerm_function_app.azurerm_function_app.name} --git-repo ${var.azurerm_functionapp_git_repo} --git-branch ${var.azurerm_functionapp_git_branch}"
  }
}

resource "null_resource" "azurerm_function_app_apikey" {
  triggers = {
    azurerm_functionapp_id = "${azurerm_function_app.azurerm_function_app.id}"

    # increment the following value when changing the provisioner script to
    # trigger the re-execution of the script
    # TODO: consider using the hash of the script content instead
    provisioner_version = "1"
  }

  depends_on = ["null_resource.azurerm_app_service_portal"]

  provisioner "local-exec" {
    command = "${join(" ", list(
      "ts-node ${var.functionapp_apikey_provisioner}",
      "--environment ${var.environment}",
      "--azurerm_resource_group ${azurerm_resource_group.azurerm_resource_group.name}",
      "--azurerm_apim ${local.azurerm_apim_name}",
      "--apim_configuration_path ${var.apim_configuration_path}",
      "--azurerm_functionapp ${azurerm_function_app.azurerm_function_app.name}"))
    }"
  }
}
