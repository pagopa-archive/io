# 5. We chose Microsoft Azure as our primary cloud provider

Date: 2017-07-17

## Status

Accepted

## Context

### Requirements

As building blocks for the services we're about to develop, we're going to need the following PaaS components:

*   A structured data store with automated distribution of data across multiple shards and regions and multi-master capabilities.
*   A message bus that supports partitioning, transactions and non destructive reads (peek).
*   A framework for building _serverless_ applications and APIs.
*   A service for managing push notifications via mobile (both iOS and Android), and browsers.
*   A service for delivering emails and text messages.
*   Facilities for application log and telemetry aggregation, analysis and monitoring.

All the above components should be fully managed and should
provide elastic and horizontal scalability, latency guarantees,
99.99% or greater availability, and a competitive TCO.

Moreover, the cloud provider should guarantee that the data
stored, transferred to and from the cloud services will never
leave the borders of the European Union.

### Market analysis

Here's a comparison of the players in the public cloud market against the above criteria:

| | Amazon Web Services | Google Cloud Platform | Microsoft Azure |
|------------------------|-----|-----|-----|
| EU data guarantees     | Yes | No  | Yes |
| Geo replicated db      | No  | [Spanner](https://cloud.google.com/spanner/) | [CosmosDB](https://docs.microsoft.com/en-us/azure/cosmos-db/)  |
| Messages / events      | [Kinesis](https://aws.amazon.com/kinesis/) / [SQS](https://aws.amazon.com/sqs/) | [Pub/Sub](https://cloud.google.com/pubsub/) | [Queue Storage](https://azure.microsoft.com/en-us/services/storage/queues/) / [Service Bus](https://azure.microsoft.com/en-us/services/service-bus/) / [Event Hubs](https://azure.microsoft.com/en-us/services/event-hubs/) |
| Serverless framework   | [Lambda](https://aws.amazon.com/lambda/) | [Functions](https://cloud.google.com/functions/) | [Functions](https://azure.microsoft.com/en-us/services/functions/) |
| Push notifications     | [SNS](https://aws.amazon.com/sns/) | [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/) | [Notification Hubs](https://azure.microsoft.com/it-it/services/notification-hubs/) |
| Email and SMS delivery | [SNS](https://aws.amazon.com/sns/) | Sendgrid / Twilio | Sendgrid / Twilio |
| Logging and telemetry  | [CloudWatch](https://aws.amazon.com/cloudwatch/) | [StackDriver](https://cloud.google.com/monitoring/) | [Application Insights](https://azure.microsoft.com/en-us/services/application-insights/) / [Log Analytics](https://azure.microsoft.com/en-us/services/log-analytics/) |

All the major players stack equally in terms of the richness and
cost effectiveness of the cloud offering and in terms of
elasticity, scalability and resiliency of the cloud platform.

Almost all the required PaaS services get offered by the major
players. A notably exception is the geographically distributed
database with multi-master capabilities, missing in the AWS
offering and recently launched by Google and Microsoft.

Finally, all major players guarantee the storage of user data
in EU regions but only Google cannot guarantee that the data
never crosses the EU border while getting transferred
through its global private network.

## Decision

We decide to select Microsoft Azure as our primary cloud provider.

## Consequences

We design our services and software components based on the
PaaS building blocks offered by Microsoft Azure. Specifically we will
rely on:

*   [CosmosDB](https://docs.microsoft.com/en-us/azure/cosmos-db/) for storing and querying structured data
*   [Queue Storage](https://azure.microsoft.com/en-us/services/storage/queues/), [Service Bus](https://azure.microsoft.com/en-us/services/service-bus/) and [Event Hubs](https://azure.microsoft.com/en-us/services/event-hubs/) for decoupling components, handling and processing asynchronous event streams
*   [Functions](https://azure.microsoft.com/en-us/services/functions/) for building serverless APIs and applications
*   [Notification Hubs](https://azure.microsoft.com/it-it/services/notification-hubs/) for delivering push notifications to apps and browsers
*   [Application Insights](https://azure.microsoft.com/en-us/services/application-insights/) and [Log Analytics](https://azure.microsoft.com/en-us/services/log-analytics/) for aggregating and analyzing application metrics and logs
