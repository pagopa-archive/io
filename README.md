# Digital Citizenship

Docs (Italian): https://teamdigitale.github.io/digital-citizenship/

## Documentation

`npm run docs:build` to build sphinx documentation

`npm run docs:publish` to deploy docs to gh-pages

## Contributing

### Architecture decisions

We use [ADR](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)s to track architectural decisions of this initiative.

This repository is configured for Nat Pryce's [_adr-tools_](https://github.com/npryce/adr-tools).

Here's the decisions we taken so far:

| ADR | Title                                                                                                                        | PR (discussion)                                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | [Record architecture decisions](architecture/decisions/0001-record-architecture-decisions.md)                                |                                                                      |
| 2   | [Use OpenAPI to define the API specs](architecture/decisions/0002-use-openapi-to-defined-the-api-specs.md)                   | [PR#3](https://github.com/teamdigitale/digital-citizenship/pull/3)   |
| 3   | [Follow a cloud native design principle](architecture/decisions/0003-follow-a-cloud-native-design-principle.md)              | [PR#4](https://github.com/teamdigitale/digital-citizenship/pull/4)   |
| 4   | [Minimize lock-in to a particular cloud provider or feature](architecture/decisions/0004-minimize-cloud-lock-in.md)          | [PR#5](https://github.com/teamdigitale/digital-citizenship/pull/5)   |
| 5   | [We chose Microsoft Azure as our primary cloud provider](architecture/decisions/0005-we-chose-our-primary-cloud-provider.md) | [PR#6](https://github.com/teamdigitale/digital-citizenship/pull/6)   |
| 6   | [Choice of primary key for citizen data](architecture/decisions/0006-choice-of-primary-key-for-citizen-data.md)              | [PR#9](https://github.com/teamdigitale/digital-citizenship/pull/9)   |
| 7   | [Choice of Azure region](architecture/decisions/0007-choice-of-azure-region.md)                                              | [PR#11](https://github.com/teamdigitale/digital-citizenship/pull/11) |
| 8   | [Choice of backend language](architecture/decisions/0008-choice-of-backend-language.md)                                      | [PR#12](https://github.com/teamdigitale/digital-citizenship/pull/12) |
| 9   | [We choose a CosmosDB API](architecture/decisions/0009-we-choose-a-cosmosdb-api.md)                                          | [PR#13](https://github.com/teamdigitale/digital-citizenship/pull/13) |
| 10  | [We select an Azure app hosting service](architecture/decisions/0010-we-select-an-azure-app-hosting-service.md)              | [PR#27](https://github.com/teamdigitale/digital-citizenship/pull/27) |

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

#### Shared Terraform state

The Terraform state is shared through an Azure
[storage container](https://www.terraform.io/docs/state/remote.html).

Before running any command involving Terraform you must request access
to the Azure container to the project administrators.

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
