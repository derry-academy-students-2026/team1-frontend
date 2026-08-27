resource "azurerm_container_app" "frontend" {
  name                         = "${var.project_name}-app-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.apps.id
  resource_group_name          = module.resource_group.resource_group_name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.app.id]
  }

  # ACR admin user is disabled, so the pull is authenticated with the identity.
  registry {
    server   = data.azurerm_container_registry.acr.login_server
    identity = azurerm_user_assigned_identity.app.id
  }

  # Resolved at revision start by the identity; the value is added in the portal.
  secret {
    name                = "session-secret"
    key_vault_secret_id = "${azurerm_key_vault.frontendKeyVault.vault_uri}secrets/${var.session_secret_name}"
    identity            = azurerm_user_assigned_identity.app.id
  }

  ingress {
    external_enabled = true
    target_port      = var.container_port
    transport        = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = "frontend"
      image  = "${data.azurerm_container_registry.acr.login_server}/${var.image_name}:${var.image_tag}"
      cpu    = var.cpu
      memory = var.memory

      env {
        name        = "SESSION_SECRET"
        secret_name = "session-secret"
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = tostring(var.container_port)
      }

      env {
        name  = "SESSION_COOKIE_SECURE"
        value = "true"
      }

      env {
        name  = "API_BASE_URL"
        value = var.api_base_url
      }

      # Toggled per environment without rebuilding the image.
      env {
        name  = "FEATURE_REGISTRATION_ENABLED"
        value = tostring(var.feature_registration_enabled)
      }

      liveness_probe {
        transport     = "HTTP"
        port          = var.container_port
        path          = "/health"
        initial_delay = 10
      }

      readiness_probe {
        transport = "HTTP"
        port      = var.container_port
        path      = "/health"
      }
    }
  }

  # The identity must be able to read the vault before the first revision starts.
  depends_on = [azurerm_role_assignment.kv_secrets_user]

  tags = {
    environment = var.environment
    project     = var.project_name
  }
}
