# 2. Use OpenAPI to defined the API specs

Date: 2017-07-17

## Status

Accepted

## Context

We need to define the API specifications of the services we're going to implement.

## Decision

We use the [OpenAPI 2.0](https://swagger.io/specification/) specification (aka Swagger spec) as standard for our REST API definitions.

## Consequences

We have to provide the API definition in YAML format (instead of JSON) for the OpenAPI API definition files due to its improved readability.
