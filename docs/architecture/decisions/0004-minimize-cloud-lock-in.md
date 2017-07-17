# 4. Minimize lock-in to a particular cloud provider or feature

Date: 2017-07-17

## Status

Accepted

## Context

There are no formal standards for describing or managing most types of cloud resources. This is because the cloud hosting market moves so rapidly. Organisations are very quick to adopt new cloud products that offer significant opportunities, but this reduces the opportunities to work with standards.

For this reason, when choosing to develop a product on top of a non-standard cloud component there's a risk of lock-in.   

## Decision

We should take steps to avoid lock-in with cloud hosting providers.

## Consequences

We can maintain a record of how many times we use something that’s unique to a specific provider.

We can also avoid lock-in by working through abstraction layers like [Kubernetes](https://kubernetes.io/) or by using common multi-cloud tooling like [Terraform](https://www.terraform.io/).

We should also keep track of indicative figures for the cost of exit from each cloud provider or feature.

In case of a significant commitment to a particular feature offered by a cloud provider, we should explain our strategy for reducing lock-in over time.

We should also consider sponsoring open source tools that work across multiple providers or developing equivalent feature functionality that works with other cloud providers.

_Credits: mostly taken from Gov.UK's guidance document on [How to assess a hosting business case](https://www.gov.uk/guidance/how-to-assess-a-hosting-business-case)._
