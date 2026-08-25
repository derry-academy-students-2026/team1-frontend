variable "resource_group_name" {
  description = "Name of the Azure resource group for the frontend infrastructure."
  type        = string
  default     = "team1-frontend-rg"
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