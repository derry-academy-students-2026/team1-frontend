terraform {
  required_version = ">= 1.9.0"

  # Backend is intentionally partial so the same code can target multiple
  # environments. Initialise with:
  #   terraform init -backend-config=backends/dev.hcl
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}

  # Falls back to ARM_SUBSCRIPTION_ID (set by the pipeline) when left null.
  subscription_id = var.subscription_id
}

locals {
  name_prefix = "${var.project}-${var.environment}"

  common_tags = merge(
    {
      project     = var.project
      environment = var.environment
      managed_by  = "terraform"
    },
    var.additional_tags
  )
}

module "resource_group" {
  source = "./modules/resource-group"

  resource_group_name = "${local.name_prefix}-rg"
  location            = var.location
  tags                = local.common_tags
}
