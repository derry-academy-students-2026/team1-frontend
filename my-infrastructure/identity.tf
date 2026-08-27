# The registry is shared across teams and created outside this configuration.
data "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = var.acr_resource_group_name
}

# One identity for both pulling the image and reading the session secret, so no
# registry password or secret value is ever stored in config or state.
resource "azurerm_user_assigned_identity" "app" {
  name                = "${var.project_name}-mi-${var.environment}"
  location            = var.location
  resource_group_name = module.resource_group.resource_group_name

  tags = {
    environment = var.environment
    project     = var.project_name
  }
}

# ACR admin user is disabled, so identity-based pull is the only option.
resource "azurerm_role_assignment" "acr_pull" {
  scope                = data.azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.app.principal_id
}
