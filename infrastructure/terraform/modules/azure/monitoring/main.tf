# Logging (OSM)

resource "azurerm_log_analytics_workspace" "log_analytics" {
  name                = "${var.organization_name}-loganalytics-${var.environment_name_short}"
  location            = "${var.location}"
  resource_group_name = "${var.resource_group_name}"
  sku                 = "Standard"
  retention_in_days   = "${var.log_analytics_workspace_retention_days}"
}

# Logging (EventHub)

resource "azurerm_eventhub_namespace" "eventhub_namespace" {
  name                = "${var.organization_name}-eventhub-ns-${var.environment_name_short}"
  location            = "${var.location}"
  resource_group_name = "${var.resource_group_name}"
  sku                 = "Standard"
  capacity            = "${var.eventhub_namespace_capacity}"
}

resource "azurerm_eventhub" "eventhub" {
  name                = "${var.organization_name}-eventhub-${var.environment_name_short}"
  namespace_name      = "${azurerm_eventhub_namespace.eventhub_namespace.name}"
  resource_group_name = "${var.resource_group_name}"
  # EventHub Partition Count has to be between 2 and 32
  partition_count     = 2
  message_retention   = 7
}

resource "azurerm_eventhub_authorization_rule" "eventhub_authorization_rule" {
  name                = "${var.organization_name}-eventhub-rule"
  namespace_name      = "${azurerm_eventhub_namespace.eventhub_namespace.name}"
  resource_group_name = "${var.resource_group_name}"
  eventhub_name       = "${azurerm_eventhub.eventhub.name}"
  listen              = true
  send                = true
  manage              = false
}
