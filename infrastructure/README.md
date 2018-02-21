# Infrastructure

## Guidelines

### Static IPs

When allocating public IP resources, especially for production deployments, remember to
[lock the resource](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-lock-resources)
to avoid accidental deletion.

### Kubernetes cluster

Once the Kubernetes cluster has been created by Terraform, you'll have to
configure you `kubectl` with the credentials to access the cluster, e.g.:

```
$ az aks get-credentials --resource-group agid-rg-test --name agid-k8s-test --admin
```
