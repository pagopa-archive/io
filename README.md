# Digital Citizenship

This is work in progress.

## Usage

`mkdocs serve` to run documentation site locally

`mkdocs gh-deploy` to deploy docs to gh-pages

## Contributing

### Architecture decisions

We use [ADR](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)s to track architectural decisions of this initiative.

This repository is configured for Nat Pryce's [_adr-tools_](https://github.com/npryce/adr-tools).

### API definitions

API definitions are in OAS (Swagger 2.0).

## Configuring the Azure infrastructure

This repository contains scripts to deploy needed PaaS on Azure cloud.

### Prerequisites

- [Git](https://git-scm.com/)
- [NodeJS](https://nodejs.org/it/) >= 0.6.x
- [Terraform](https://terraform.io) >= 0.10.x

All binaries must be in the system path.

### Deploy instructions

- Get an [Azure account](https://azure.microsoft.com/en-us/free)

- Set up an [Active Directory Principal](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-application-objects)

- Set up environment variables:

```
export ARM_SUBSCRIPTION_ID=<subscription Id>
export ARM_CLIENT_ID=<service principal client (app) Id>
export ARM_CLIENT_SECRET=<service principal client secret (key)>
export ARM_TENANT_ID=<Active Directory domain Id>
```

- edit configuration file `infrastructure/tfvars.json`

- edit Terraform configuration file `infrastructure/azure.cf`

- Run the following commands:

`npm install`
`npm run resources:deploy`

This task will deploy the following services to an Azure resource group:

- [App service plan](https://azure.microsoft.com/en-us/pricing/details/app-service/plans/)
- [Functions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-overview) app (configured)
- [CosmosDB database](https://docs.microsoft.com/en-us/azure/cosmos-db/introduction) (and collections)
- [Storage account](https://docs.microsoft.com/en-us/azure/storage/common/storage-introduction)
- [Storage queues](https://azure.microsoft.com/en-us/services/storage/queues/) (for emails and messages)
- [Blob storage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction)
- [API management](https://docs.microsoft.com/en-us/azure/api-management/api-management-key-concepts) (with configuration)
- [Application insights](https://azure.microsoft.com/it-it/services/application-insights/)
- [Log analytics](https://azure.microsoft.com/en-au/services/log-analytics/)

Most services get provisioned by Terraform (see `infrastructure/azure.tf`).

Some services aren't yet supported by Terraform (CosmosDB database and collections, [Functions](https://github.com/terraform-providers/terraform-provider-azurerm/issues/131), API manager);
these ones are created by NodeJS scripts (`infrastructure/tasks`) that provision the services through the
[Azure Resource Manager APIs](https://github.com/Azure/azure-sdk-for-node).

#### Storing Terraform state remotely

By default, Terraform stores state locally in a file named `terraform.tfstate`. 
If you want to [store Terraform state remotely](https://www.terraform.io/docs/state/remote.html)
you can use an Azure storage container. 

Before running any command involving Terraform:

- edit `infrastructure/azure.tf`, uncomment the lines with the Terraform backend settings
(read the comments inside the file) and set up resource group name and storage container name

- go to the [Azure portal](https://portal.azure.com) and create the relative resources
(resource group, storage account, storage container)

#### Example output

```
$ npm run resources:deploy

> digital-citizenship@0.1.0 resources:deploy ...digital-citizenship
> npm-run-all resources:tf-init resources:tf-apply resources:cosmosdb resources:functions resources:api

> digital-citizenship@0.1.0 resources:tf-init ...digital-citizenship
> terraform init -var-file=infrastructure/tfvars.json infrastructure

Initializing provider plugins...

...

Terraform has been successfully initialized!

...

> digital-citizenship@0.1.0 resources:tf-apply ...digital-citizenship
> terraform apply -var-file=infrastructure/tfvars.json infrastructure

...

Apply complete! Resources: 9 added, 0 changed, 0 destroyed.

> digital-citizenship@0.1.0 resources:cosmosdb ...digital-citizenship
> ts-node infrastructure/tasks/00-cosmosdb.ts

successfully deployed cosmsodb database and collections

> digital-citizenship@0.1.0 resources:functions ...digital-citizenship
> ts-node infrastructure/tasks/10-functions.ts

...

```
