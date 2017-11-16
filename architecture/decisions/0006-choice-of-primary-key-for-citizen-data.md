# 6. Choice of primary key for citizen data

Date: 2017-07-19

## Status

Accepted

## Context

We are going to associate data to citizens, thus we need to
define a primary key for identifying citizens in the data model.

Italian citizens have a "natural" identification key: the Fiscal Code (FC).

For natural persons, the [FC is made of 16 alphanumeric characters](https://en.wikipedia.org/wiki/Italian_fiscal_code_card#Fiscal_code_generation).

The FC is supposed to be unique and immutable but these properties are not always true: a person may have his FC revoked or changed (e.g. after a change of name or because his FC is not unique).

## Decision

The citizen's FC will be used when defining a primary key for a citizen entity.

In general, no component handling citizen entities should assume that the primary key is actually a FC. This would prevent extending the system to include citizens with other kind of keys (e.g. foreign citizens).

## Consequences

Entities representing citizens will be uniquely identified by
the citizen's FC.

FCs should always be stored in a normalized form (all upper case, no spaces).

Since there's a chance of a citizen having his fiscal code changed, we should make sure that no ADR will prevent changing the association of data for a citizen to a different FC.

Finally, the services provided by the digital citizenship platform cannot be used by people that don't have a FC (e.g. most non-Italian citizens).
