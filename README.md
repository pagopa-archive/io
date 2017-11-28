# Digital Citizenship

This is the main repository of the Digital Citizenship project, managed by
[AgID](http://agid.gov.it) and the [Digital Transformation Team](https://teamdigitale.governo.it/en/49-content.htm).

This repository stores technical documentation and code, for a more friendly
introduction on the topic, check out the following pages (Italian):

*   The [Digital Citizenship project page](https://teamdigitale.governo.it/it/projects/cittadinanza-digitale.htm)
    in the Digital Transformation Team site for high level introduction.
*   The [Digital Citizenship documentation site](https://teamdigitale.github.io/digital-citizenship/)
    for more indepth explanation of the project components and goals.

## Child projects

### The Digital Citizenship APIs

*   [backlog](https://www.pivotaltracker.com/n/projects/2088623)
*   [API source](https://github.com/teamdigitale/digital-citizenship-functions)
*   [docs](https://teamdigitale.github.io/digital-citizenship/)

### The Digital Citizenship mobile app

*   backlog: [app](https://www.pivotaltracker.com/n/projects/2048617)
    and [app backend](https://www.pivotaltracker.com/n/projects/2116794)
*   code: [app](https://github.com/teamdigitale/italia-app)
    and [app backend](https://github.com/teamdigitale/italia-backend)

## Contributing

### Architecture decision records

We use [ADR](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)s
to track architectural decisions of this initiative.

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
| 11  | [We chose a different CosmosDB API](architecture/decisions/0011-we-chose-a-different-cosmosdb-api.md)                        | [PR#28](https://github.com/teamdigitale/digital-citizenship/pull/28) |

### Azure infrastructure

The [infrastructure](https://github.com/teamdigitale/digital-citizenship/tree/master/infrastructure)
drectory contains scripts and Terraform configuration to deploy the
infrastructure on the Azure cloud.

#### Prerequisites

-   [Git](https://git-scm.com/)
-   [Terraform](https://terraform.io) >= 0.10.x
-   [NodeJS](https://nodejs.org/it/) >= 0.6.x
-   NPM packages, run `npm install`

All binaries must be in the system path.

#### Setting up the Azure credentials

1.  Get an [Azure account](https://azure.microsoft.com/en-us/free)
1.  Set up an [Active Directory Principal](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-application-objects)
1.  Set up environment variables:

```
export ARM_SUBSCRIPTION_ID=<subscription Id>
export ARM_CLIENT_ID=<service principal client (app) Id>
export ARM_CLIENT_SECRET=<service principal client secret (key)>
export ARM_TENANT_ID=<Active Directory domain Id>
```

#### Shared Terraform state

The Terraform state is shared through an Azure
[storage container](https://www.terraform.io/docs/state/remote.html).

Before running any command involving Terraform you must request access
to the Azure container to the project administrators.

#### Making changes to the configuration

1.  edit configuration file `infrastructure/tfvars.json`
1.  edit Terraform configuration file `infrastructure/azure.cf`

#### Apply the changes

The deploy task will configure the following services:

-   [App service plan](https://azure.microsoft.com/en-us/pricing/details/app-service/plans/)
-   [Functions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-overview) app (configured)
-   [CosmosDB database](https://docs.microsoft.com/en-us/azure/cosmos-db/introduction) (and collections)
-   [Storage account](https://docs.microsoft.com/en-us/azure/storage/common/storage-introduction)
-   [Storage queues](https://azure.microsoft.com/en-us/services/storage/queues/) (for emails and messages)
-   [Blob storage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction)
-   [API management](https://docs.microsoft.com/en-us/azure/api-management/api-management-key-concepts) (with configuration)
-   [Application insights](https://azure.microsoft.com/it-it/services/application-insights/)
-   [Log analytics](https://azure.microsoft.com/en-au/services/log-analytics/)

_Note_: Most services get provisioned by Terraform (see `infrastructure/azure.tf`).
Some services aren't yet supported by Terraform (CosmosDB database and collections, [Functions](https://github.com/terraform-providers/terraform-provider-azurerm/issues/131), API manager);
these ones are created by NodeJS scripts (`infrastructure/tasks`) that provision the services through the
[Azure Resource Manager APIs](https://github.com/Azure/azure-sdk-for-node).

To apply the changes, run the following command:

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

## Other

### Building the documentation site

The source of the Digital Citizenship documentation site is under the `docs`
directory of this repository.

To build the sphinx documentation from this repository:

```
npm run docs:build
```

To deploy the documentation site (via GitHub pages):

```
npm run docs:publish
```
