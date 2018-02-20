variable "environment" {
  type = "string"
  description = "Name of the environment"
}

variable "resource_group_location" {
  type = "string"
  description = "The location of the resource group"
}

variable "resource_group_name" {
  type = "string"
  description = "The name of the resource group"
}

variable "name" {
  type = "string"
  description = "The name of the container service resource"
}

variable "admin_username" {
  type = "string"
  description = "The username for the admin account on cluster nodes"
}

variable "admin_ssh_publickey" {
  type = "string"
  description = "The ssh public key for the admin account on cluster nodes"
}

variable "agent_count" {
  type = "string"
  description = "How many agent nodes in the cluster"
}

# See VM sizes https://docs.microsoft.com/en-us/azure/virtual-machines/linux/sizes
variable "agent_vm_size" {
  type = "string"
  description = "Virtual machine size for agent nodes"
}

variable "service_principal_client_id" {
  type = "string"
  description = "The client ID of the service principal"
}

variable "service_principal_client_secret" {
  type = "string"
  description = "The client secret of the service principal"
}

