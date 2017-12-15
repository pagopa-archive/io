# Terraform configuration file to create Azure resources.
# Set up environment variables before running this script (see README.md)

#
# COMMON RESOURCES
#

module "common" {
  source = "./modules/azure/common"

  organization_name = "${var.organization_name}"
  environment_name = "production"
  environment_name_short = "prod"
  location = "${var.primary_location}"
}

module "monitoring" {
  source = "./modules/azure/monitoring"

  organization_name = "${var.organization_name}"
  environment_name = "production"
  environment_name_short = "prod"
  location = "${var.primary_location}"
  resource_group_name = "${module.common.resource_group_name}"
}

#
# PRODUCTION ENVIRONMENT RESOURCES
#

module "env-production" {
  source = "./modules/azure/environment"

  organization_name = "${var.organization_name}"
  environment_name = "production"
  environment_name_short = "prod"
  primary_location = "${var.primary_location}"
  secondary_location = "${var.secondary_location}"
  resource_group_name = "${module.common.resource_group_name}"
  developer_portal_domain = "developer.cd.italia.it"
}

#
# TEST ENVIRONMENT RESOURCES
#

module "env-test" {
  source = "./modules/azure/environment"

  organization_name = "${var.organization_name}"
  environment_name = "test"
  environment_name_short = "test"
  primary_location = "${var.primary_location}"
  secondary_location = "${var.secondary_location}"
  resource_group_name = "${module.common.resource_group_name}"
}
