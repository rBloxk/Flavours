variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "flavours-production"
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "domain" {
  description = "Domain name"
  type        = string
  default     = "flavours.club"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "Stripe secret key"
  type        = string
  sensitive   = true
}

variable "supabase_url" {
  description = "Supabase URL"
  type        = string
}

variable "supabase_service_role_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
}

variable "firebase_project_id" {
  description = "Firebase project ID"
  type        = string
}

variable "firebase_private_key" {
  description = "Firebase private key"
  type        = string
  sensitive   = true
}

variable "firebase_client_email" {
  description = "Firebase client email"
  type        = string
}

variable "firebase_storage_bucket" {
  description = "Firebase storage bucket"
  type        = string
}

variable "redis_url" {
  description = "Redis URL"
  type        = string
}

variable "sentry_dsn" {
  description = "Sentry DSN"
  type        = string
  sensitive   = true
}

variable "new_relic_license_key" {
  description = "New Relic license key"
  type        = string
  sensitive   = true
}

variable "datadog_api_key" {
  description = "DataDog API key"
  type        = string
  sensitive   = true
}

variable "sendgrid_api_key" {
  description = "SendGrid API key"
  type        = string
  sensitive   = true
}

variable "content_moderation_api_key" {
  description = "Content moderation API key"
  type        = string
  sensitive   = true
}

variable "age_verification_api_key" {
  description = "Age verification API key"
  type        = string
  sensitive   = true
}

variable "dmca_email" {
  description = "DMCA email"
  type        = string
}

variable "alert_email" {
  description = "Alert email"
  type        = string
}

variable "alert_slack_webhook" {
  description = "Alert Slack webhook"
  type        = string
  sensitive   = true
}

variable "alert_discord_webhook" {
  description = "Alert Discord webhook"
  type        = string
  sensitive   = true
}

variable "backup_encryption_key" {
  description = "Backup encryption key"
  type        = string
  sensitive   = true
}

variable "bi_database_url" {
  description = "Business Intelligence database URL"
  type        = string
  sensitive   = true
}
