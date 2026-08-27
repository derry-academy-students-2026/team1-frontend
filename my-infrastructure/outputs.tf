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

output "frontend_url" {
  description = "Public HTTPS URL of the deployed frontend."
  value       = "https://${azurerm_container_app.frontend.ingress[0].fqdn}"
}

output "key_vault_name" {
  description = "Name of the Key Vault holding the session secret."
  value       = azurerm_key_vault.frontendKeyVault.name
}

output "managed_identity_client_id" {
  description = "Client ID of the identity used for ACR pull and Key Vault reads."
  value       = azurerm_user_assigned_identity.app.client_id
}