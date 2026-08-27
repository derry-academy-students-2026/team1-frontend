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