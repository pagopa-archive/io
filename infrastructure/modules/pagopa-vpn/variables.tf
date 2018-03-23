# This is required for conditionally enable this module
variable "enable" {
  type        = "string"
  default     = "false"
  description = "Enables the module when set to 'true'"
}

variable "environment" {
  type        = "string"
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
  type        = "string"
  description = "The location of the resource group"
}

variable "resource_group_name" {
  type        = "string"
  description = "The name of the resource group"
}

variable "site_gateway_address" {
  type        = "string"
  description = "The IP address of the site gateway"
}

variable "vpn_shared_key" {
  type        = "string"
  description = "The shared key for the VPN link"
}

variable "aks_rg_name" {
  type        = "string"
  description = "The name of the resource group created by AKS"
}

variable "aks_vnet_id" {
  type        = "string"
  description = "The ID of the VNet created by AKS"
}

variable "aks_vnet_name" {
  type        = "string"
  description = "The name of the VNet created by AKS"
}

variable "aks_nsg_name" {
  type        = "string"
  description = "The name of the network security group created by AKS"
}

variable "aks_nodes_cidr" {
  type        = "string"
  description = "The CIDR of the AKS agent nodes"
}

variable "lb_ssh_key" {
  type        = "string"
  description = "The SSH key for the admin user of the loadbalancer VM"
}
