# 8. Choice of backend language

Date: 2017-07-26

## Status

Accepted

## Context

Most of the business logic for the backend services (HTTP APIs, async event pocessing) will be deployed on [Azure Functions](https://azure.microsoft.com/en-us/services/functions/) (Azure's serverless, reactive framework).

Azure Functions [provides 1st class support](https://docs.microsoft.com/en-us/azure/azure-functions/functions-compare-logic-apps-ms-flow-webjobs) for the .NET/C#/F# and the Node/Javascript runtimes.

|                  | .NET/C#/F# | Node/Javascript |
| ---------------- | ---------- | --------------- |
| Support on Azure | 1st        | 1st             |
| Open Source      | No (1)     | Yes             |
| Typesafe         | Yes        | Yes (2)         |
| Performance      | High       | Medium          |
| Traction         | Medium     | High            |
| Tools            | Best       | Good            |
| Ecosystem        | Good       | Best            |

*   (1) Only the core .NET runtime is open source (MONO)
*   (2) Type safety can be achieved with Typescript or Flow

## Decision

We decide to implement the backend logic using [TypeScript](https://www.typescriptlang.org/), a typed superset of Javascript that compiles to Javascript.

We favor TypeScript due to its superior tooling and workflow, compared to other alternatives (see for instance a [comparison of TypeScript against Flow](https://github.com/niieani/typescript-vs-flowtype)).

## Consequences

Backend logic will be implemented in TypeScript and a build pipeline will
be created for generating Javascript code to be deployed on Azure Functions.
