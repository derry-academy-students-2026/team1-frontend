variable "project" {
  description = "Short project name used as the prefix for every resource name."
  type        = string
  default     = "team1-frontend"
}

variable "location" {
  description = "Azure region where resources are created."
  type        = string
  default     = "uksouth"
}

variable "environment" {
  description = "Deployment environment. Drives resource naming and tagging."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, or prod."
  }
}

variable "subscription_id" {
  description = "Azure subscription ID. Leave null to fall back to the ARM_SUBSCRIPTION_ID environment variable."
  type        = string
  default     = null
}

variable "additional_tags" {
  description = "Extra tags merged on top of the standard project/environment tags."
  type        = map(string)
  default     = {}
}
