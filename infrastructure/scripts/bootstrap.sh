#!/bin/bash

RESOURCE_PREFIX=io-italia
RESOURCE_GROUP_NAME=$RESOURCE_PREFIX-tfstate
RESOURCE_VAULT_NAME=$RESOURCE_PREFIX-vault
STORAGE_ACCOUNT_NAME=ioitaliatstate
CONTAINER_NAME=tfstate

# Create resource group
az group create --name $RESOURCE_GROUP_NAME --location westeurope


# Create storage account
az storage account create --resource-group $RESOURCE_GROUP_NAME --name $STORAGE_ACCOUNT_NAME --sku Standard_LRS --encryption-services blob

# Get storage account key
ACCOUNT_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP_NAME --account-name $STORAGE_ACCOUNT_NAME --query [0].value -o tsv)

# Create vault
az keyvault create --name $RESOURCE_VAULT_NAME --resource-group $RESOURCE_GROUP_NAME --location northeurope

# Add account key to the vault
az keyvault secret set --vault-name $RESOURCE_VAULT_NAME --name 'terraform-backend-key' --value  $ACCOUNT_KEY

# Create blob container
az storage container create --name $CONTAINER_NAME --account-name $STORAGE_ACCOUNT_NAME --account-key $ACCOUNT_KEY

export ARM_ACCESS_KEY=$(az keyvault secret show --name terraform-backend-key --vault-name $RESOURCE_VAULT_NAME --query value -o tsv)

echo "storage_account_name: $STORAGE_ACCOUNT_NAME"
echo "container_name: $CONTAINER_NAME"
echo "access_key: $ACCOUNT_KEY"


cat <<EOT > backend.config
resource_group_name  = "$RESOURCE_GROUP_NAME"
storage_account_name = "$STORAGE_ACCOUNT_NAME"
container_name       = "$CONTAINER_NAME"
key                  = "tfstate"
EOT
