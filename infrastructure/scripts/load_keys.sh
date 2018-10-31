#!/bin/bash

RESOURCE_PREFIX=io-italia
RESOURCE_GROUP_NAME=$RESOURCE_PREFIX-tfstate
RESOURCE_VAULT_NAME=$RESOURCE_PREFIX-vault


export ENVIRONMENT=production
export ARM_TENANT_ID=ca56f479-cd47-4a67-b3c9-d81f8143f3f6
export ARM_SUBSCRIPTION_ID=6e961b21-0284-4811-a7fb-c91fed7bf2e1
export ARM_CLIENT_ID=b06b1ead-bf62-4f9a-b096-a4bb29bb5390
export ARM_CLIENT_SECRET=$(az keyvault secret show --name service-principal-secret --vault-name $RESOURCE_VAULT_NAME --query value -o tsv)
export ARM_ACCESS_KEY=$(az keyvault secret show --name terraform-backend-key --vault-name $RESOURCE_VAULT_NAME --query value -o tsv)

export TF_VAR_ARM_CLIENT_SECRET=$ARM_CLIENT_SECRET
export TF_VAR_DEV_PORTAL_CLIENT_ID=$(az keyvault secret show --name DEV-PORTAL-CLIENT-ID --vault-name $RESOURCE_VAULT_NAME --query value -o tsv)
export TF_VAR_DEV_PORTAL_CLIENT_SECRET=$(az keyvault secret show --name DEV-PORTAL-CLIENT-SECRET --vault-name $RESOURCE_VAULT_NAME --query value -o tsv)
export TF_VAR_DEV_PORTAL_EXT_CLIENT_ID=$(az keyvault secret show --name DEV-PORTAL-CLIENT-ID --vault-name $RESOURCE_VAULT_NAME --query value -o tsv)
export TF_VAR_DEV_PORTAL_EXT_CLIENT_SECRET=$(az keyvault secret show --name DEV-PORTAL-CLIENT-SECRET --vault-name $RESOURCE_VAULT_NAME --query value -o tsv)
export TF_VAR_ADB2C_TENANT_ID=ioitalia.onmicrosoft.com

export TF_VAR_SENDGRID_KEY=$(az keyvault secret show --name SENDGRID-KEY --vault-name $RESOURCE_VAULT_NAME --query value -o tsv)
export TF_VAR_MAILUP_SECRET=$(az keyvault secret show --name MAILUP-SECRET --vault-name $RESOURCE_VAULT_NAME --query value -o tsv)
export TF_VAR_MAILUP_USERNAME=$(az keyvault secret show --name MAILUP-USERNAME --vault-name $RESOURCE_VAULT_NAME --query value -o tsv)
export TF_VAR_WEBHOOK_CHANNEL_URL_TOKEN=$(az keyvault secret show --name WEBHOOK-CHANNEL-URL-TOKEN --vault-name $RESOURCE_VAULT_NAME --query value -o tsv)
export TF_VAR_WEBHOOK_CHANNEL_URL_TOKEN=$(az keyvault secret show --name WEBHOOK-CHANNEL-URL-TOKEN --vault-name $RESOURCE_VAULT_NAME --query value -o tsv)
export TF_VAR_azurerm_linux_admin_ssh_publickey=$(az keyvault secret show --name ADMIN-SSH-PUBKEY --vault-name $RESOURCE_VAULT_NAME --query value -o tsv)
export TF_VAR_azurerm_service_principal_client_id=$ARM_CLIENT_ID
export TF_VAR_azurerm_service_principal_client_secret=$ARM_CLIENT_SECRET

#export TF_VAR_pagopa_vpn_shared_key=''
#export TF_VAR_pagopa_vpn_site_gateway_ip=
