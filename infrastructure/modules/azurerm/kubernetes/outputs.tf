# The allocated static IP must be set in loadBalancerIP in the ingress config
# of the Kubernetes cluster
# See https://kubernetes.io/docs/concepts/services-networking/service/#type-loadbalancer
output "public_ip_container_service_ip" {
  value = "${azurerm_public_ip.azurerm_public_ip_container_service.ip_address}"
}
