# Digital Citizenship

This is the main repository of the Digital Citizenship project, managed by
[AgID](http://agid.gov.it) and the
[Digital Transformation Team](https://teamdigitale.governo.it/en/49-content.htm).

This repository stores technical documentation and code, for a more friendly
introduction on the topic, check out the following pages (Italian):

* The
  [Digital Citizenship project page](https://teamdigitale.governo.it/it/projects/cittadinanza-digitale.htm)
  in the Digital Transformation Team site for high level introduction.
* The
  [Digital Citizenship documentation site](https://teamdigitale.github.io/digital-citizenship/)
  for more indepth explanation of the project components and goals.

## Child projects

### The Digital Citizenship APIs

* [backlog](https://www.pivotaltracker.com/n/projects/2088623)
* [API source](https://github.com/teamdigitale/digital-citizenship-functions)
* [docs](https://teamdigitale.github.io/digital-citizenship/)

### The Digital Citizenship mobile app

* backlog: [app](https://www.pivotaltracker.com/n/projects/2048617) and
  [app backend](https://www.pivotaltracker.com/n/projects/2116794)
* code: [app](https://github.com/teamdigitale/italia-app) and
  [app backend](https://github.com/teamdigitale/italia-backend)

## Contributing

### Architecture decision records

In a world of evolutionary architecture, it's important to record certain design
decisions for the benefit of future team members as well as for external
oversight. Architecture Decision Records is a technique for capturing important
architectural decisions along with their context and consequences. We store
these details in source control, along with code, as then they can provide a
record that remains in sync with the code itself.

We use
[ADR](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)s
to track architectural decisions of this initiative.

This repository is configured for Nat Pryce's
[_adr-tools_](https://github.com/npryce/adr-tools).

Here's the decisions we taken so far:

| ADR | Title                                                                                                                                             | PR (discussion)                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | [Record architecture decisions](architecture/decisions/0001-record-architecture-decisions.md)                                                     |                                                                      |
| 2   | [Use OpenAPI to define the API specs](architecture/decisions/0002-use-openapi-to-defined-the-api-specs.md)                                        | [PR#3](https://github.com/teamdigitale/digital-citizenship/pull/3)   |
| 3   | [Follow a cloud native design principle](architecture/decisions/0003-follow-a-cloud-native-design-principle.md)                                   | [PR#4](https://github.com/teamdigitale/digital-citizenship/pull/4)   |
| 4   | [Minimize lock-in to a particular cloud provider or feature](architecture/decisions/0004-minimize-cloud-lock-in.md)                               | [PR#5](https://github.com/teamdigitale/digital-citizenship/pull/5)   |
| 5   | [We chose Microsoft Azure as our primary cloud provider](architecture/decisions/0005-we-chose-our-primary-cloud-provider.md)                      | [PR#6](https://github.com/teamdigitale/digital-citizenship/pull/6)   |
| 6   | [Choice of primary key for citizen data](architecture/decisions/0006-choice-of-primary-key-for-citizen-data.md)                                   | [PR#9](https://github.com/teamdigitale/digital-citizenship/pull/9)   |
| 7   | [Choice of Azure region](architecture/decisions/0007-choice-of-azure-region.md)                                                                   | [PR#11](https://github.com/teamdigitale/digital-citizenship/pull/11) |
| 8   | [Choice of backend language](architecture/decisions/0008-choice-of-backend-language.md)                                                           | [PR#12](https://github.com/teamdigitale/digital-citizenship/pull/12) |
| 9   | [We choose a CosmosDB API](architecture/decisions/0009-we-choose-a-cosmosdb-api.md)                                                               | [PR#13](https://github.com/teamdigitale/digital-citizenship/pull/13) |
| 10  | [We select an Azure app hosting service](architecture/decisions/0010-we-select-an-azure-app-hosting-service.md)                                   | [PR#27](https://github.com/teamdigitale/digital-citizenship/pull/27) |
| 11  | [We chose a different CosmosDB API](architecture/decisions/0011-we-chose-a-different-cosmosdb-api.md)                                             | [PR#28](https://github.com/teamdigitale/digital-citizenship/pull/28) |
| 12  | [We chose a retry strategy in case of processing errors](architecture/decisions/0012-we-chose-a-retry-strategy.md)                                | [PR#48](https://github.com/teamdigitale/digital-citizenship/pull/48) |
| 13  | [We decide how to expose the app backend to the internet](architecture/decisions/0013-we-decide-how-to-expose-the-app-backend-to-the-internet.md) | [PR#52](https://github.com/teamdigitale/digital-citizenship/pull/52) |

## Other

### Building the documentation site

The source of the Digital Citizenship documentation site is under the `docs`
directory of this repository.

#### Prerequisites

* [Python language runtime](https://www.python.org/downloads/)
* [Python pip](https://pip.pypa.io/en/stable/installing/)
* [Sphinx](http://www.sphinx-doc.org/en/stable/install.html)

Then install the following packages:

```
pip install recommonmark
pip install sphinx-rtd-theme
```

#### Build the documentation

To build the sphinx documentation from this repository:

```
yarn docs:build
```

#### Publish the documentation

To deploy the documentation site (via GitHub pages):

```
yarn docs:publish
```

