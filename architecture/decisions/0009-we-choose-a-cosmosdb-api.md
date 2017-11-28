# 9. We choose a CosmosDB API

Date: 2017-08-02

## Status

Accepted

Amended by [11. We chose a different CosmosDB API](0011-we-chose-a-different-cosmosdb-api.md)

## Context

[CosmosDB](https://docs.microsoft.com/en-us/azure/cosmos-db/) provide two document-oriented APIs:

* [DocumentDB API](http://azure.github.io/azure-documentdb-node/DocumentClient.html)
* [MongoDB API](http://mongodb.github.io/node-mongodb-native/2.0/)

For the purpose of the Digital Citizenship project we will need the following capabilities:

* Single document CRUD operations
* Query capabilities on secondary indexes (with filtering, result limiting and ordering)
* Conflict detection during concurrency writes

We also want to minimize the coupling with proprietary technologies and protocols.

Comparison of the CosmosDB APIs:

|                    | DocumentDB API | MongoDB API |
| ------------------ | -------------- | ----------- |
| CRUD operations    | Yes            | Yes         |
| Query capabilities | Yes            | Yes         |
| Conflict detection | Yes            | Yes (1)     |
| Lock-in            | High           | Low         |

(1) Conflict detection is not supported by the MongoDB API but can be implemented at the application level via [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) with the addition of a `version` field to the documents.  

## Decision

We decide to implement all database operations via the MongoDB API.

## Consequences

All CosmosDB operations will be implemented via the MongoDB API 2.0.

We will have to include a `version` field to each document, initialized at the value of `0`.

Update operations should:

* be preceeded by reading the version of the document that needs to be updated
* implement a record constraint based on the expected version of the document
* increment the version of the document
* detect update failure and implement a retry mechanism  

