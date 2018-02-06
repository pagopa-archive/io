# 11. We have chosen a retry strategy in case of processing errors

Date: 2018-02-06

## State

Accepted

## Context

To perform asynchronous operations we use [Azure Storage Queues](https://azure.microsoft.com/en-us/services/storage/queues/)):
enqueued messages are processed by the methods exposed by Azure Functions using [triggers](https://docs.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings.

In case some error occurs it is necessary to re-schedule the message in the queue
to be processed at a later time.

Our goal is to re-schedule the processing at increasing intervals, using an exponential back off strategy for retries.

The default behavior is specified in the [triggers documentation](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-queue#trigger---poison-messages):

> When a queue trigger function fails, the Azure functions retry the function up to five times for a given queued message, including the first attempt. 
> If all five attempts fail, the runtime> functions adds a message to a queue called <originalqueuename> -poison.

Currently the Function SDK does not provide an *output binding* to delay the processing of an enqueued message.
It is therefore necessary to implement a custom retry policy to schedule messages over a longer period of time.

## Decision

The following possibilities, to delay message processing, have been considered:

1. Switching from Storage Queues to [ServiceBus](https://docs.microsoft.com/en-us/azure/service-bus/):
that allows to schedule messages at specified point in time bue [there are some known issues] (https://github.com/Azure/Azure-Functions/issues/454#issuecomment-324785962) that suggest to avoid this approach. Moreover the ServiceBus is more expensive
and has less storage capability than Storage Queues.
1. Using [Durable Functions](https://docs.microsoft.com/en-us/azure/azure-functions/durable-functions-overview#language-support): this is only supported
in .NET environment.
1. Using a [Custom Queue Processor](https://stackoverflow.com/questions/26937782/queuetrigger-attribute-visibility-timeout): this is only supported in .NET environments and is not documented.
1. Update the *visibilityTimeout* parameter in enqueued messages (https://github.com/Azure/azure-webjobs-sdk/issues/1040)

At the time of writing Functions don't provide an [output binding to set the `visibilityTimeout`](https://github.com/Azure/azure-webjobs-sdk/issues/1040)
on one individual message, but only a global setting in the [host.json file](https://docs.microsoft.com/en-us/azure/azure-functions/functions-host-json).

To manage processing errors, we decided to update `visibilityTimeout` value using the methods provided by the
[Azure Storage SDK](https://github.com/Azure/azure-storage-node) and re-enqueue the messages that caused the error.

## Consequences

The implemented strategy, that uses the [SDK method `updateMessage()`](http://azure.github.io/azure-storage-node/QueueService.html#updateMessage__anchor), lets us re-schedule messages with an exponential back off and a maximum time to live of 7 days.
