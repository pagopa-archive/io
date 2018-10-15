
variable environment {
  type        = "string"
  description = "Environment: production or test"
}

variable environment_short {
  type        = "string"
  description = "Short version of environment name: prod or test (used in resource names)"
}

variable "azurerm_resource_name_prefix" {
  type        = "string"
  description = "Prefix for naming resources (e.g. 'myorg')"
}

variable location {
  type        = "string"
  description = "Location of the Azure resource group and services (ie. West Europe)"
}

variable "cosmosdb_failover_location" {
  type        = "string"
  description = "Location for CosmosDB failover (ie. North Europe), Must differ from 'location'"
}

variable "message_blob_container" {
  default     = "message-content"
  description = "Name of the message container blob"
}

variable "azurerm_functionapp_git_repo" {
  default     = "https://github.com/teamdigitale/digital-citizenship-functions"
  description = "The GitHub repository that must be associated to the function app"
}

variable "azurerm_functionapp_git_branch" {
  default     = "funcpack-release-latest"
  description = "The branch of the GitHub repository that must be associated to the function app"
}

variable "azurerm_storage_queue_emailnotifications" {
  type        = "string"
  description = "Name of the storage queue for email notifications"
}

variable "azurerm_storage_queue_webhooknotifications" {
  type        = "string"
  description = "Name of the storage queue for notifications sent to webhook"
}

variable "azurerm_storage_queue_createdmessages" {
  type        = "string"
  description = "Name of the storage queue for created messages"
}

variable "azurerm_storage_queue_profileevents" {
  type        = "string"
  description = "Name of the storage queue for profile events (create / update)"
}

variable "azurerm_cosmosdb_collections" {
  type        = "map"
  description = "Name and partition keys of collections that must exist in the CosmosDB database"
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

variable "azurerm_apim_sku" {
  type        = "string"
  description = "SKU (tier) of the API management"
}

variable "azurerm_adb2c_policy" {
  type        = "string"
  description = "Name of ADB2C policy used in the API management portal authentication flow"
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

variable "webhook_channel_url" {
  type        = "string"
  description = "URL to contact when sending notifications to the webhook (without the secret token)"
}

# TF_VAR_WEBHOOK_CHANNEL_URL_TOKEN
variable "WEBHOOK_CHANNEL_URL_TOKEN" {
  type        = "string"
  description = "Secret token that is appended to the webhook_channel_url"
}

variable "azurerm_apim_eventhub_rule" {
  type        = "string"
  description = "EventHub rule for API management"
}

# Notification HUB

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

# This should be passed by ENV var TF_VAR_NOTIFICATION_HUB_APNS_KEY
variable "NOTIFICATION_HUB_APNS_KEY" {
  type        = "string"
  description = "APNS Key"
}

# This should be passed by ENV var TF_VAR_NOTIFICATION_HUB_APNS_KEY_ID
variable "NOTIFICATION_HUB_APNS_KEY_ID" {
  type        = "string"
  description = "APNS key Id"
}

# This should be passed by ENV var TF_VAR_NOTIFICATION_HUB_GCM_KEY
variable "NOTIFICATION_HUB_GCM_KEY" {
  type        = "string"
  description = "GCM Key"
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

variable "azurerm_kubernetes_admin_username" {
  type        = "string"
  description = "The username of the admin account on the Kubernetes nodes"
}

variable "azurerm_kubernetes_admin_ssh_publickey_file" {
  type        = "string"
  description = "The name of the file under 'files' of the ssh public key for the admin account on the Kubernetes nodes"
}

variable "azurerm_kubernetes_agent_count" {
  type        = "string"
  description = "How many agent nodes in the Kubernetes cluster"
}

# See VM sizes https://docs.microsoft.com/en-us/azure/virtual-machines/linux/sizes
variable "azurerm_kubernetes_agent_vm_size" {
  type        = "string"
  description = "Virtual machine size for agent nodes in Kubernetes cluster"
}

variable "ARM_CLIENT_SECRET" {
  type        = "string"
  description = "The client secret of the service principal"
}

# DNS configuration for the default email provider

variable "azurerm_dns_main_zone" {
  type        = "string"
  description = "The domain used by Digital Citizenship subsystems"
}

variable "azurerm_dns_main_zone_spf1" {
  type        = "string"
  description = "Default email provider spf1 DNS record"
}

variable "azurerm_dns_main_zone_dkim" {
  type        = "map"
  description = "Default email provider dkim DNS records"
}

# PagoPA VPN

variable "pagopa_vpn_site_gateway_ip" {
  default     = ""
  description = "The IP address of the pagoPA VPN gateway"
}

variable "pagopa_vpn_shared_key" {
  default     = ""
  description = "The shared key to be used by the pagoPA VPN"
}

#
# Paths to local provisioner scripts
#

variable "cosmosdb_collection_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_cosmosdb_collection.ts"
}

variable "website_git_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_website_git.ts"
}

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

variable "cosmosdb_iprange_provisioner" {
  default = "infrastructure/local-provisioners/azurerm_cosmosdb_iprange.ts"
}
