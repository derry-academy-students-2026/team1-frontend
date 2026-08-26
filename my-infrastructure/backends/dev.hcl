# Remote state for the dev environment.
# Usage: terraform init -backend-config=backends/dev.hcl
# To add prod later, copy this file to backends/prod.hcl and change only the key.
resource_group_name  = "team1-tfstate-rg"
storage_account_name = "team1tfstatecm20260825"
container_name       = "tfstate"
key                  = "team1-frontend/dev.terraform.tfstate"
use_azuread_auth     = true
