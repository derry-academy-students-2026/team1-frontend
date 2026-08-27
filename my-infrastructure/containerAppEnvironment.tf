resource "azurerm_log_analytics_workspace" "container_apps" {
  name                = "${var.project_name}-logs-${var.environment}"
  location            = var.location
  resource_group_name = module.resource_group.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = var.log_retention_days

  tags = {
    environment = var.environment
    project     = var.project_name
  }
}

# Provides the shared network boundary, DNS suffix and TLS for apps running in it.
resource "azurerm_container_app_environment" "apps" {
  name                       = "${var.project_name}-env-${var.environment}"
  location                   = var.location
  resource_group_name        = module.resource_group.resource_group_name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.container_apps.id

  tags = {
    environment = var.environment
    project     = var.project_name
  }
}
