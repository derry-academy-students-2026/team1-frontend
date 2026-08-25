terraform {
  backend "azurerm" {
    resource_group_name  = "team1-tfstate-rg"
    storage_account_name = "team1tfstatecm20260825"
    container_name       = "tfstate"
    key                  = "team1-frontend.terraform.tfstate"
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

module "resource_group" {
  source = "./modules/resource-group"

  resource_group_name = var.resource_group_name
  location            = var.location

  tags = {
    environment = var.environment
    managed_by  = "terraform"
  }
}