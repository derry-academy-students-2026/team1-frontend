terraform {
  # key is intentionally omitted here and supplied per-environment via
  # `terraform init -backend-config="key=team1-frontend-<env>.terraform.tfstate"`
  # so each environment (dev, prod, ...) gets its own state file.
  backend "azurerm" {
    resource_group_name  = "team1-tfstate-rg"
    storage_account_name = "team1tfstatecm20260825"
    container_name       = "tfstate"
    use_azuread_auth     = true
    use_cli              = true
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
}

locals {
  # dev, prod, etc. all share this naming convention - adding an
  # environments/prod.tfvars file is all that's needed for a prod environment
  resource_group_name = "${var.resource_group_name}-${var.environment}-rg"
}

module "resource_group" {
  source = "./modules/resource-group"

  resource_group_name = local.resource_group_name
  location            = var.location

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}