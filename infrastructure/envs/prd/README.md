# Infrastructure

## Guidelines

### Static IPs

When allocating public IP resources, especially for production deployments, remember to
[lock the resource](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-lock-resources)
to avoid accidental deletion.

### Kubernetes cluster

#### Credentials

Once the Kubernetes cluster has been created by Terraform, you'll have to
configure you `kubectl` with the credentials to access the cluster, e.g.:

```
$ az aks get-credentials --resource-group agid-rg-test --name agid-k8s-test --admin
```

#### Using static IPs in LoadBalancer resources

Azure AKS is [not able to use a public IP outside its own resource group](https://github.com/Azure/AKS/issues/70)
so once you create the AKS cluster, you may need to manually move the public IP
created by Terraform into the AKS resource group.

