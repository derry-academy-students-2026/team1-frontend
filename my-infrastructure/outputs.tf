output "resource_group_name" {
  description = "Name of the created Azure resource group."
  value       = module.resource_group.resource_group_name
}

output "resource_group_id" {
  description = "Azure resource ID of the created resource group."
  value       = module.resource_group.resource_group_id
}

output "resource_group_location" {
  description = "Azure region where the resource group was created."
  value       = var.location
}