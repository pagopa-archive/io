# IO

This is the main repository of the IO project, managed by
[PagoPA S.p.a.](https://www.pagopa.gov.it).

This repository stores technical documentation and code, for a more friendly
introduction on the topic, check out the [IO project page](https://io.italia.it).

## Child projects

### IO mobile app

* backlog: [app](https://www.pivotaltracker.com/n/projects/2048617) and
  [backend](https://www.pivotaltracker.com/n/projects/2116794)
* code: [app](https://github.com/pagopa/io-app) and
  [app backend](https://github.com/pagopa/io-backend)

### IO APIs

* [backlog](https://www.pivotaltracker.com/n/projects/2088623)
* [API source](https://github.com/pagopa/io-functions-services)
* [docs](https://redocly.github.io/redoc/?url=https://raw.githubusercontent.com/pagopa/io-functions-services/master/openapi/index.yaml)

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
