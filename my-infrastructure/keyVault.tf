data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "frontendKeyVault" {
  name                = "${var.project_name}-kv-${var.environment}"
  location            = var.location
  resource_group_name = module.resource_group.resource_group_name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  purge_protection_enabled   = false
  soft_delete_retention_days = 7

  # Set at creation because Azure will not allow the model to change later.
  rbac_authorization_enabled = true

  tags = {
    environment = var.environment
    project     = var.project_name
  }
}

# Secret values are added manually in the portal, so Terraform never needs
# data-plane access and no secret ever lands in state.
resource "azurerm_role_assignment" "kv_secrets_user" {
  scope                = azurerm_key_vault.frontendKeyVault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.app.principal_id
}
