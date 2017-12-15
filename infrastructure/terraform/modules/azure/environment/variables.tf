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

variable "resource_group_name" {
  type = "string"
  description = "Name of the Azure resource group where resources will be created"
}

variable "primary_location" {
  type = "string"
  description = "Primary location of the Azure resources (ie. West Europe)"
}

variable "secondary_location" {
  type = "string"
  description = "Secondary location of the Azure resources, for failover (ie. North Europe)"
}

variable "developer_portal_domain" {
  type = "string"
  default = ""
  description = "Custom developer portal domain (optional)"
}
