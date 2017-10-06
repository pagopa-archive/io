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

- Run the following commands:

`npm install`
`npm run resources:deploy`

