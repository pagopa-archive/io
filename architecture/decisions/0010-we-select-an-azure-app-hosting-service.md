# 10. We select an Azure app hosting service

Date: 2017-11-28

## Status

Accepted

## Context

Most components of the Digital Citizenship platform are designed on the
serverless runtime model, specifically they are developed for the Azure
Functions platform.

Some components don't fit into this model, specifically the integration with
the SPID authentication service requires the deployment of an instance of the
[Shibboleth](https://wiki.shibboleth.net/confluence/display/SHIB2) SAML
Service Provider that sits in front of the application that needs to be secured
by SPID authentication.

This kind of deployment requires a VM/container IaaS service.

## Decision

Microsoft Azure provides two application hosting services that suits our needs:

| Service                                                                                      | Pros | Cons |
| -------------------------------------------------------------------------------------------- | ---- | ---- |
| [Web App for Containers](https://azure.microsoft.com/en-us/services/app-service/containers/) | Flexible and portable (it's basically a DCOS or Kubernetes platform) | High configuration/management effort |
| [Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/)                      | Low configuration/management effort | Deployment mechanism specific to the service, harder to port to other platforms |

Given that:

1.  We already have a working Docker container that provides a SPID/Shibboleth
    setup.
2.  We want to minimize the coupling to non open-source technologies

We decide that we will use *Web App for Containers* to setup a *Kubernetes*
cluster.

## Consequences

1.  We will add the setup of a Kubernetes cluster and the Azure Container
    Registry as part of the infrastructure setup logic.
2.  We will deploy all non-serverless components as Docker containers in the
    Kubernetes cluster.
3.  We will store all Docker images in the [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry/)
