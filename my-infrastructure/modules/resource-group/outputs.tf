output "resource_group_name" {
  description = "Name of the resource group."
  value       = azurerm_resource_group.this.name
}

output "resource_group_id" {
  description = "Azure resource ID of the resource group."
  value       = azurerm_resource_group.this.id
}