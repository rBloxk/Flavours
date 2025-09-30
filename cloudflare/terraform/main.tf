# Cloudflare Terraform Configuration

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_api_token" {
  description = "Cloudflare API Token"
  type        = string
  sensitive   = true
}

variable "domain" {
  description = "Domain name"
  type        = string
  default     = "flavours.club"
}

# Get zone information
data "cloudflare_zones" "main" {
  filter {
    name = var.domain
  }
}

# SSL/TLS Configuration
resource "cloudflare_zone_settings_override" "ssl" {
  zone_id = data.cloudflare_zones.main.zones[0].id
  
  settings {
    ssl = "full_strict"
    always_use_https = "on"
    min_tls_version = "1.2"
    tls_1_3 = "on"
    hsts_enabled = "on"
    hsts_max_age = 31536000
    hsts_include_subdomains = "on"
    hsts_preload = "on"
  }
}

# Security Settings
resource "cloudflare_zone_settings_override" "security" {
  zone_id = data.cloudflare_zones.main.zones[0].id
  
  settings {
    security_level = "high"
    browser_check = "on"
    hotlink_protection = "on"
  }
}

# Caching Settings
resource "cloudflare_zone_settings_override" "caching" {
  zone_id = data.cloudflare_zones.main.zones[0].id
  
  settings {
    cache_level = "aggressive"
    browser_cache_ttl = 14400
  }
}

# Speed Settings
resource "cloudflare_zone_settings_override" "speed" {
  zone_id = data.cloudflare_zones.main.zones[0].id
  
  settings {
    minify {
      css = "on"
      html = "on"
      js = "on"
    }
    brotli = "on"
    http2 = "on"
    http3 = "on"
  }
}

# Firewall Rules
resource "cloudflare_firewall_rule" "block_suspicious_countries" {
  zone_id = data.cloudflare_zones.main.zones[0].id
  description = "Block Suspicious Countries"
  filter_id = cloudflare_filter.block_suspicious_countries.id
  action = "block"
}

resource "cloudflare_filter" "block_suspicious_countries" {
  zone_id = data.cloudflare_zones.main.zones[0].id
  description = "Block Suspicious Countries"
  expression = "(ip.geoip.country in {\"CN\" \"RU\" \"KP\" \"IR\"}) and (http.request.uri.path contains \"/api/\")"
}

resource "cloudflare_firewall_rule" "rate_limit_api" {
  zone_id = data.cloudflare_zones.main.zones[0].id
  description = "Rate Limit API Endpoints"
  filter_id = cloudflare_filter.rate_limit_api.id
  action = "challenge"
}

resource "cloudflare_filter" "rate_limit_api" {
  zone_id = data.cloudflare_zones.main.zones[0].id
  description = "Rate Limit API Endpoints"
  expression = "(http.request.uri.path contains \"/api/\") and (cf.threat_score gt 14)"
}

# Page Rules
resource "cloudflare_page_rule" "api_routes" {
  zone_id = data.cloudflare_zones.main.zones[0].id
  target = "${var.domain}/api/*"
  priority = 1
  status = "active"
  
  actions {
    cache_level = "bypass"
    security_level = "high"
  }
}

resource "cloudflare_page_rule" "static_assets" {
  zone_id = data.cloudflare_zones.main.zones[0].id
  target = "${var.domain}/_next/static/*"
  priority = 2
  status = "active"
  
  actions {
    cache_level = "cache_everything"
    edge_cache_ttl = 31536000
    browser_cache_ttl = 31536000
  }
}

# Bot Management
resource "cloudflare_bot_management" "main" {
  zone_id = data.cloudflare_zones.main.zones[0].id
  
  enable_js = true
  fight_mode = true
  allow_verified_bots = true
  allow_search_engines = true
  allow_social_media = true
  allow_advertising = false
  allow_automation = false
}

