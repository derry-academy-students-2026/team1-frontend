# Owned by the backend repo. The frontend joins it because internal ingress is
# only resolvable between apps in the same Container App environment.
data "azurerm_container_app_environment" "apps" {
  name                = var.container_app_environment_name
  resource_group_name = var.container_app_environment_resource_group_name
}
