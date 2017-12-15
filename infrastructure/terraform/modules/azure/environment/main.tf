module "apim" {
  source = "../apim"

  organization_name = "${var.organization_name}"
  environment_name = "${var.environment_name}"
  environment_name_short = "${var.environment_name_short}"
  resource_group_name = "${var.resource_group_name}"
  location = "${var.primary_location}"
}

module "functionapp" {
  source = "../functionapp"

  organization_name = "${var.organization_name}"
  environment_name = "${var.environment_name}"
  environment_name_short = "${var.environment_name_short}"
  resource_group_name = "${var.resource_group_name}"
  location = "${var.primary_location}"
  cosmosdb_failover_location = "${var.secondary_location}"
  storage_queue_names = ["emailnotifications", "createdmessages"]
}
