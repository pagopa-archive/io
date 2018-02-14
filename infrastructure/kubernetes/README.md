# Kubernetes config for the Digital Citizenship project

## What is this

This directory contains the configuration for deploying the backend components
of the Digital Citizenship projects in the Kubernetes (K8S) cluster provisioned
by Terraform.

## Prerequisites

  1. Install and setup `kubectl`
  1. Configure the K8S cluster credentials (on Azure you'll need `az acs` for
     legacy K8S or `az aks` for managed K8S).
  1. [Switch the context](https://kubernetes-v1-4.github.io/docs/user-guide/kubectl/kubectl_config_use-context/)
     for the environment you want to work on (e.g. test or production).

## Configuring resources

Resources should be configured in the following order:

  1. `cert-manager.yml` (the `cert-manager` chart needs to be installed before this step, see below)
  1. `ingress.yml`

The following should be configured in any order:

  * `app-backend.yml`

## Additional components

### Installing Cert Manager

We use [Cert Manager](https://github.com/jetstack/cert-manager) for
automatically provision the TLS certificates for public HTTPS endpoints.

Cert Manager is [deployed](https://github.com/jetstack/cert-manager/blob/master/docs/user-guides/deploying.md)
via [Helm](https://github.com/kubernetes/helm) with the
[Ingress shim](https://github.com/jetstack/cert-manager/blob/master/docs/user-guides/deploying.md#addendum)
enabled.

_Note: you may need to [upgrade Tiller](https://github.com/kubernetes/helm/blob/master/docs/install.md#upgrading-tiller)
(Helm's server counterpart) as Azure installs by default an old version of
Tiller (i.e. v2.6.1)_

## Troubleshooting

### SSH-ing into the master nodes

You'll need the private SSH key used to provision the nodes (ask an admin for
that), then you'll need to lookup the FQDN of the master in the Azure portal,
then:

```
$ ssh -i PRIVATE_KEY_PATH k8s-admin@MASTER_FQDN
```

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

### Cluster role cluster-admin not found

There's an [issue](https://github.com/Azure/acs-engine/issues/1892) related to
recent versions of ACS. In case Help complaints about `cluster-admin` role
missing, you can create it manually by ssh-ing into a master node, then:

```
$ cat > cluster-admin.yml
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRole
metadata:
  creationTimestamp: null
  name: cluster-admin
  annotations:
    rbac.authorization.kubernetes.io/autoupdate: "true"
rules:
- apiGroups:
  - '*'
  resources:
  - '*'
  verbs:
  - '*'
- nonResourceURLs:
  - '*'
  verbs:
  - '*'
```

Then run `kubectl` with the insecure port:

```
$ kubectl -s 127.0.0.1:8080 apply -f cluster-admin.yml
clusterrole "cluster-admin" created
```


