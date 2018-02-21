# Kubernetes config for the Digital Citizenship project

## What is this

This directory contains the configuration for deploying the backend components
of the Digital Citizenship projects in the Kubernetes (K8S) cluster provisioned
by Terraform.

## Prerequisites

  1. Install and setup `kubectl`
  1. Configure the K8S cluster credentials (`az aks get-credentials --admin`).
  1. Install and configure [Helm](https://helm.sh/) (the package manager for
     Kubernetes) properly configured for your cluster (see
     the below)
  1. [Switch the context](https://kubernetes-v1-4.github.io/docs/user-guide/kubectl/kubectl_config_use-context/)
     for the environment you want to work on (e.g. `test` or `production`).

## Configuring resources

### System resources

The system resources should be configured in the following order.

#### 1. Cert-Manager Issuers

Before configuring the certificate issuers, make sure the `cert-manager` chart
is properly installed and configured. Then run:

```
$ kubectl apply -f system/cert-manager-issuers.yml
clusterissuer "letsencrypt-staging" created
clusterissuer "letsencrypt-prod" created
```

#### 2. Ingress

Once certificate issuers are ready, you can configure the ingress:

```
$ kubectl apply -f system/ingress.yml
deployment "default-http-backend" created
service "default-http-backend" created
deployment "nginx-ingress-controller" created
ingress "ingress-nginx" created
service "ingress-nginx-service" created
```

### Application resources

The following should be configured in any order.

#### App backend

Before creating the `app-backend` resources you must create the secret that will
provide the SPID certificates used by the app backend:

```
$ kubectl create secret generic spid-cert --from-file=./cert.pem --from-file=./key.pem
secret "spid-cert" created
```

Once the secret has been created, you can create or update the application pods:

```
$ kubectl apply -f app-backend.yml
deployment "app-backend" configured
service "app-backend" configured
```

## Additional components

### Installing Helm

#### Creating cluster-admin role

There's an [issue](https://github.com/Azure/acs-engine/issues/1892) related to
recent versions of ACS and AKS. In case Help complaints about `cluster-admin` role
missing, you can create it manually:

Then run `kubectl` with the insecure port:

```
$ kubectl apply -f system/cluster-admin.yml --namespace=kube-system
clusterrole "cluster-admin" created
```

_Note: you will be able to create the admin role only if you requested `admin`
credentials with `az aks get-credentials`._

#### Creating the Service Account for Tiller

Once you have created the `cluster-admin` you'll have to create a service
account for Tiller and bind it to the `cluster-admin` role:

```
$ kubectl create -f system/tiller-rbac-config.yaml
serviceaccount "tiller" created
clusterrolebinding "tiller" created
```

#### Install Tiller in the cluster

Not you can install Tiller giving it the proper rights:

```
$ helm init --service-account tiller
Tiller (the Helm server-side component) has been upgraded to the current version.
Happy Helming!
```

### Installing Cert Manager

We use [Cert Manager](https://github.com/jetstack/cert-manager) for
automatically provision the TLS certificates for public HTTPS endpoints.

Cert Manager is [deployed](https://github.com/jetstack/cert-manager/blob/master/docs/user-guides/deploying.md)
via Helm with the
[Ingress shim](https://github.com/jetstack/cert-manager/blob/master/docs/user-guides/deploying.md#addendum)
enabled.

_Note: you may need to [upgrade Tiller](https://github.com/kubernetes/helm/blob/master/docs/install.md#upgrading-tiller)
(Helm's server counterpart) as Azure installs by default an old version of
Tiller (i.e. v2.6.1)_

## Troubleshooting

### Helm cannot connect to Tiller

In case the `helm` client is unable to create a port forwarding tunnel to Tiller
you can create a tunnel manually with:

```
$ kubectl -n kube-system port-forward \
  $(kubectl -n kube-system get pod -l app=helm -o jsonpath='{.items[0].metadata.name}') \
  44134
```

and then run `helm` as:

```
$ HELM_HOST=:44134 helm COMMAND
```
