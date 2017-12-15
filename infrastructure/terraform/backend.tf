# Azure backend for storing Terraform state.
# The storage account and the container must exist and you must have
# read-write access before Terraform can be executed.

terraform {
    backend "azurerm" {
        resource_group_name  = "terraform-resource-group"
        storage_account_name = "terraformstorageaccount"
        container_name       = "terraform-storage-container"
        key                  = "terraform.tfstate"
    }
}
