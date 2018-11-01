# Terraform configuration file to create Azure resources.
# Set up environment variables before running this script (see README.md)

provider "azurerm" {
  version = "~> 1.17.0"
}

provider "random" {
  version = "~> 1.1"
}

provider "null" {
  version = "~> 1.0"
}

# Set up an Azure backend to store Terraform state.
# You *must* create the storage account and the container before running this script

terraform {
  backend "azurerm" {}
}

# Compute name of resources
#
# Instead of explicitly defining the name of each resource, we use a convention
# to compose the name of the resource as: PREFIX-RESOURCE_TYPE-ENVIRONMENT_SHORT
#
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


## RESOURCE GROUP

# Create a resource group if it doesn’t exist
resource "azurerm_resource_group" "azurerm_resource_group" {
  name     = "${local.azurerm_resource_group_name}"
  location = "${var.location}"

  tags {
    environment = "${var.environment}"
  }
}

