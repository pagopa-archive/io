# This is required for conditionally enable this module
variable "enable" {
  type = "string"
  default = "false"
  description = "Enables the module when set to 'true'"
}

variable "environment" {
  type = "string"
  description = "Name of the environment"
}

variable environment_short {
  type        = "string"
  description = "Short version of environment name: prod or test (used in resource names)"
}

variable "azurerm_resource_name_prefix" {
  type        = "string"
  description = "Prefix for naming resources (e.g. 'myorg')"
}

variable "resource_group_location" {
  type = "string"
  description = "The location of the resource group"
}

variable "resource_group_name" {
  type = "string"
  description = "The name of the resource group"
}

variable "site_gateway_address" {
  type = "string"
  description = "The IP address of the site gateway"
}

variable "vpn_shared_key" {
  type = "string"
  description = "The shared key for the VPN link"
}
