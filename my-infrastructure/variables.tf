variable "resource_group_name" {
  description = "Base name (without environment suffix) for the Azure resource group."
  type        = string
  default     = "team1-frontend"
}

variable "project_name" {
  description = "Project short name used for naming Azure resources."
  type        = string
  default     = "team1-frontend"
}

variable "location" {
  description = "Azure region where the resource group is created."
  type        = string
  default     = "uksouth"
}

variable "environment" {
  description = "Deployment environment for the frontend infrastructure."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, or prod."
  }
}

variable "acr_name" {
  description = "Name of the shared Azure Container Registry holding the frontend image."
  type        = string
  default     = "acraiacademy26"
}

variable "acr_resource_group_name" {
  description = "Resource group containing the shared Azure Container Registry."
  type        = string
  default     = "rg-ai-academy-26"
}

variable "container_app_environment_name" {
  description = "Name of the shared Container App environment, created by the backend repo."
  type        = string
  default     = "team1-backend-dev-aca-env"
}

variable "container_app_environment_resource_group_name" {
  description = "Resource group containing the shared Container App environment."
  type        = string
  default     = "team1-backend-dev-rg"
}

variable "backend_app_name" {
  description = "Name of the backend Container App, used to build its internal URL."
  type        = string
  default     = "team1-backend-dev-app"
}

variable "session_secret_name" {
  description = "Name of the Key Vault secret holding the Express session secret. Created manually in the portal."
  type        = string
  default     = "session-secret"
}

variable "feature_registration_enabled" {
  description = "Feature flag controlling whether user registration is available."
  type        = bool
  default     = true
}
variable "image_name" {
  description = "Repository name of the frontend image within the container registry."
  type        = string
  default     = "team1-frontend"
}

variable "image_tag" {
  description = "Tag of the frontend image to deploy. CI passes the commit SHA."
  type        = string
  default     = "latest"
}

variable "container_port" {
  description = "Port the Express app listens on inside the container."
  type        = number
  default     = 3000
}

variable "min_replicas" {
  description = "Minimum number of container replicas."
  type        = number
  default     = 1
}

variable "max_replicas" {
  description = "Maximum number of container replicas."
  type        = number
  default     = 3
}

variable "cpu" {
  description = "CPU cores allocated to the container."
  type        = number
  default     = 0.25
}

variable "memory" {
  description = "Memory allocated to the container. Must pair with cpu per Azure's allowed combinations."
  type        = string
  default     = "0.5Gi"
}