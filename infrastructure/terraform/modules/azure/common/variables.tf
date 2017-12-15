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
