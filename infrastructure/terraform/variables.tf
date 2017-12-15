variable "organization_name" {
  type = "string"
  description = "All resources will be named using the organization name as prefix (e.g. org-resource-name)"
}

variable "primary_location" {
  type = "string"
  description = "Primary location of the Azure resources (ie. West Europe)"
}

variable "secondary_location" {
  type = "string"
  description = "Secondary location of the Azure resources, for failover (ie. North Europe)"
}
