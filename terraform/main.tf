terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Variables
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

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "container.googleapis.com",
    "cloudbuild.googleapis.com",
    "containerregistry.googleapis.com",
    "sqladmin.googleapis.com",
    "storage-api.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "secretmanager.googleapis.com",
    "compute.googleapis.com",
    "dns.googleapis.com",
    "certificatemanager.googleapis.com",
    "firebase.googleapis.com",
    "firestore.googleapis.com",
    "firebasehosting.googleapis.com"
  ])

  service = each.value
  disable_on_destroy = false
}

# Create GKE cluster
resource "google_container_cluster" "flavours_cluster" {
  name     = "flavours-cluster"
  location = var.region

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.flavours_network.name
  subnetwork = google_compute_subnetwork.flavours_subnet.name

  # Enable network policy
  network_policy {
    enabled = true
  }

  # Enable logging and monitoring
  logging_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
  }

  monitoring_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
  }

  # Enable IP aliases
  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  # Enable autopilot
  enable_autopilot = true

  # Enable private cluster
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  # Enable master authorized networks
  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = "0.0.0.0/0"
      display_name = "All"
    }
  }

  depends_on = [google_project_service.apis]
}

# Create node pool
resource "google_container_node_pool" "flavours_nodes" {
  name       = "flavours-node-pool"
  location   = var.region
  cluster    = google_container_cluster.flavours_cluster.name
  node_count = 3

  node_config {
    preemptible  = false
    machine_type = "e2-standard-2"
    disk_size_gb = 50
    disk_type    = "pd-ssd"

    # Enable autoscaling
    management {
      auto_repair  = true
      auto_upgrade = true
    }

    # Enable autoscaling
    autoscaling {
      min_node_count = 1
      max_node_count = 10
    }

    # Service account
    service_account = google_service_account.gke_node_sa.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    # Enable workload identity
    workload_metadata_config {
      mode = "GKE_METADATA"
    }
  }

  depends_on = [google_project_service.apis]
}

# Create VPC network
resource "google_compute_network" "flavours_network" {
  name                    = "flavours-network"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
}

# Create subnet
resource "google_compute_subnetwork" "flavours_subnet" {
  name          = "flavours-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.flavours_network.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.1.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.2.0.0/20"
  }
}

# Create Cloud SQL instance
resource "google_sql_database_instance" "flavours_db" {
  name             = "flavours-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro"
    
    disk_type = "PD_SSD"
    disk_size = 20
    disk_autoresize = true

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      location                       = var.region
      point_in_time_recovery_enabled = true
    }

    ip_configuration {
      ipv4_enabled    = true
      require_ssl     = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }

    database_flags {
      name  = "log_statement"
      value = "all"
    }

    database_flags {
      name  = "log_min_duration_statement"
      value = "1000"
    }
  }

  deletion_protection = false

  depends_on = [google_project_service.apis]
}

# Create database
resource "google_sql_database" "flavours_database" {
  name     = "flavours"
  instance = google_sql_database_instance.flavours_db.name
}

# Create database user
resource "google_sql_user" "flavours_user" {
  name     = "flavours_user"
  instance = google_sql_database_instance.flavours_db.name
  password = var.db_password
}

# Create Cloud Storage bucket
resource "google_storage_bucket" "flavours_media" {
  name          = "flavours-production-media"
  location      = var.region
  storage_class = "STANDARD"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }

  lifecycle_rule {
    condition {
      age = 7
    }
    action {
      type = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  cors {
    origin          = ["https://${var.domain}", "https://api.${var.domain}"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Create service accounts
resource "google_service_account" "gke_node_sa" {
  account_id   = "gke-node-sa"
  display_name = "GKE Node Service Account"
}

resource "google_service_account" "backend_sa" {
  account_id   = "flavours-backend"
  display_name = "Flavours Backend Service Account"
}

resource "google_service_account" "cloud_sql_proxy_sa" {
  account_id   = "flavours-cloud-sql-proxy"
  display_name = "Flavours Cloud SQL Proxy Service Account"
}

resource "google_service_account" "gcs_fuse_sa" {
  account_id   = "flavours-gcs-fuse"
  display_name = "Flavours GCS Fuse Service Account"
}

# Grant IAM roles
resource "google_project_iam_member" "backend_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

resource "google_project_iam_member" "backend_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

resource "google_project_iam_member" "backend_monitoring_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

resource "google_project_iam_member" "backend_logging_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

resource "google_project_iam_member" "cloud_sql_proxy_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_sql_proxy_sa.email}"
}

resource "google_project_iam_member" "gcs_fuse_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.gcs_fuse_sa.email}"
}

# Create secrets
resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password"

  replication {
    automatic = true
  }

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"

  replication {
    automatic = true
  }

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret
}

# Create static IP
resource "google_compute_global_address" "flavours_backend_ip" {
  name = "flavours-backend-ip"
}

# Create SSL certificate
resource "google_compute_managed_ssl_certificate" "flavours_backend_ssl" {
  name = "flavours-backend-ssl-cert"

  managed {
    domains = ["api.${var.domain}"]
  }
}

# Create DNS zone
resource "google_dns_managed_zone" "flavours_zone" {
  name        = "flavours-zone"
  dns_name    = "${var.domain}."
  description = "DNS zone for Flavours"
}

# Create DNS records
resource "google_dns_record_set" "flavours_a" {
  name = "${var.domain}."
  type = "A"
  ttl  = 300

  managed_zone = google_dns_managed_zone.flavours_zone.name

  rrdatas = [google_compute_global_address.flavours_backend_ip.address]
}

resource "google_dns_record_set" "flavours_api_a" {
  name = "api.${var.domain}."
  type = "A"
  ttl  = 300

  managed_zone = google_dns_managed_zone.flavours_zone.name

  rrdatas = [google_compute_global_address.flavours_backend_ip.address]
}

# Outputs
output "cluster_name" {
  value = google_container_cluster.flavours_cluster.name
}

output "cluster_endpoint" {
  value = google_container_cluster.flavours_cluster.endpoint
}

output "cluster_ca_certificate" {
  value = google_container_cluster.flavours_cluster.master_auth[0].cluster_ca_certificate
}

output "db_connection_name" {
  value = google_sql_database_instance.flavours_db.connection_name
}

output "storage_bucket_name" {
  value = google_storage_bucket.flavours_media.name
}

output "backend_service_account_email" {
  value = google_service_account.backend_sa.email
}

output "static_ip_address" {
  value = google_compute_global_address.flavours_backend_ip.address
}
