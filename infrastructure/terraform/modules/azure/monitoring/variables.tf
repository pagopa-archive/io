variable "organization_name" {
  type = "string"
  description = "All resources will be named using the organization name as prefix (e.g. org-resource-name)"
}

variable "environment_name" {
  type = "string"
  description = "The full name of the environment (e.g. production)"
}

variable "environment_name_short" {
  type = "string"
  description = "An optional short name of the environment used for naming resources (e.g. prod for production)"
}

variable "location" {
  type = "string"
  description = "Location where new resources will be created"
}

variable "resource_group_name" {
  type = "string"
  description = "Name of the Azure resource group where resources will be created"
}

variable "log_analytics_workspace_retention_days" {
  type = "string"
  default = "30"
  description = "Days of log retention for the Azure Log Analytics Workspace"
}

variable "eventhub_namespace_capacity" {
  type = "string"
  default = "1"
  description = "Capacity of the Azure EventHub resource"
}
