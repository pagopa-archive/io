# The public IP of out VPN gateway
# WARNING - due to some unknown reasons, the IP address that Terraform will
# output MAY differ from the actual IP address associated to the resource.
# PLEASE double check on the Azure dashboard.
output "vpn_gateway_public_ip" {
  value = "${azurerm_public_ip.default.*.ip_address}"
}