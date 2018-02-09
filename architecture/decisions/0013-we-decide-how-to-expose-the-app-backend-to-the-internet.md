# 13. We decide how to expose the app backend to the internet

Date: 2018-02-09

## Status

Accepted

## Context

The frontend side of the Digital Citizenship project consists of a mobile
application named [italia-app](https://github.com/teamdigitale/italia-app).
The `italia-app` application relies on a backend application ([italia-backend](https://github.com/teamdigitale/italia-backend))
for intermediating the interaction with external services (e.g. the Digital
Citizenship APIs) and for coordinating the SPID authentication process.

The `italia-app` application is deployed as a Docker container inside a
Kubernetes cluster, provisioned by Terraform.

### How italia-app is exposed to the internet

![img](https://www.planttext.com/plantuml/img/LP0_QyD03CLtVGgDxM1IQ0PJGad9KkWIYBTIZ6mhyH7xpfLq7LhwtMkRr7_WXkEzt-aztLwDn6BR0FXGCJgZnb5ENGTm5cePNxwZCFxS_2uMZIjpDzblwMaohwdcolBbIfu5vo_2ggln1PLNzXN0xtXWJiLTaYJFSmm-uNRxk7dDikC9O9Pt0xN8wxcxx72y1rYA4tKhiQR-nP5QD-l1z65C7LOpHd6NsZ2SyNtnyWDmB8R6qZfFve87b12D5OK_8wjXGSeL1ezrKDjqP3KC0SDKW7r_xJ__3m00)

[source of diagram](https://www.planttext.com/?text=LP0_QyD03CLtVGgDxM1IQ0PJGad9KkWIYBTIZ6mhyH7xpfLq7LhwtMkRr7_WXkEzt-aztLwDn6BR0FXGCJgZnb5ENGTm5cePNxwZCFxS_2uMZIjpDzblwMaohwdcolBbIfu5vo_2ggln1PLNzXN0xtXWJiLTaYJFSmm-uNRxk7dDikC9O9Pt0xN8wxcxx72y1rYA4tKhiQR-nP5QD-l1z65C7LOpHd6NsZ2SyNtnyWDmB8R6qZfFve87b12D5OK_8wjXGSeL1ezrKDjqP3KC0SDKW7r_xJ__3m00)

Requests coming from the app to the backend gets routed through a few components:

  1. An Azure public IP with a firewall configured to listen on port 443
  1. A K8S service that routes the port 443 to the Ingress
  1. A K8S Ingress that terminates the HTTPS connection and routes the request based on the HTTP `Host` and path
  1. The `italia-backend` app.

### Requests that italia-backend needs to serve

Now, given the above high level diagram, let's see what requests the `italia-backend`
application needs to serve and what are the requirements/implications considering
that the HTTPS connection is terminated by the Ingress.

...

## Decision

Decision here...

## Consequences

Consequences here...
