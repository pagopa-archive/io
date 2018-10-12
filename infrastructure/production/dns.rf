# DNS Zone
#
resource "azurerm_dns_zone" "azurerm_dns_main_zone" {
  name                = "${var.azurerm_dns_main_zone}"
  resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"

  # This resource must exist only in the "production" environment
  count = "${var.environment == "production" ? 1 : 0}"
}

# default email provider txt spf1 dns record
resource "azurerm_dns_txt_record" "azurerm_dns_main_zone_spf1" {
  count               = "${var.environment == "production" ? 1 : 0}"
  resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
  zone_name           = "${azurerm_dns_zone.azurerm_dns_main_zone.name}"
  name                = "@"
  ttl                 = 3600

  record {
    value = "${var.azurerm_dns_main_zone_spf1}"
  }
}

# default email provider cname dkim dns records
resource "azurerm_dns_cname_record" "azurerm_dns_main_zone_dkim" {
  count               = "${var.environment == "production" ? length(keys(var.azurerm_dns_main_zone_dkim)) : 0}"
  resource_group_name = "${azurerm_resource_group.azurerm_resource_group.name}"
  zone_name           = "${azurerm_dns_zone.azurerm_dns_main_zone.name}"
  name                = "${element(keys(var.azurerm_dns_main_zone_dkim), count.index)}"
  record              = "${lookup(var.azurerm_dns_main_zone_dkim, element(keys(var.azurerm_dns_main_zone_dkim), count.index))}"
  ttl                 = 3600
}
