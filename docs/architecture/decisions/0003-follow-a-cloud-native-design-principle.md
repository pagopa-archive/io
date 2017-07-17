# 3. Follow a cloud native design principle

Date: 2017-07-17

## Status

Accepted

## Context

We need to design the building blocks of the Digital Citizenship platform. We will make decisions about the overall architecture and the building blocks we're going to use to satisfy the functional and non-functional requirements.

When deciding what technologies to use and how to satisfy those requirements, we're going to evaluate whether we want to build certain components from scratch, use open-source solutions managed by us or rely on existing public cloud components, managed by 3rd party providers.

As the world of cloud technologies continues to accelerate, we should absorb new developments into how we work. Leading technology organisations are rapidly embracing new tools like "serverless" computing.

At the infrastructure and application level we should expect our applications to be resilient, flexible and API-driven. We should have the tools and practices in place to manage and secure a distributed range of tools accessed over the internet.

Decision criteria will also include:

* elasticity and resilience
* pay-as-you-go pricing
* exploiting economies of scale
* exploiting falling costs of infrastructure over time
* quality of management tools
* best of breed security
* flexibility and opportunity costs

## Decision

We decide to build the components of the Digital Citizenship initiative on top of scalable, managed and cost-effective components provided by the leading public cloud providers.

## Consequences

We will make use of public cloud hosting. Since this is an evolving area, which started with ‘Infrastructure as a Service’, and is changing with the development of ‘Platform as a Service’ (PaaS) offerings, we should monitor the space very closely and understand pros and cons of each IaaS and PaaS service.

Moreover, we should always source a cloud provider that fits our needs, rather than selecting a provider based on recommendation.

_Disclaimer: freely inspired and sourced from Gov.UK [cloud first](https://www.gov.uk/guidance/government-cloud-first-policy) and [cloud native](https://governmenttechnology.blog.gov.uk/2017/02/03/clarifying-our-cloud-first-commitment/) strategies._
