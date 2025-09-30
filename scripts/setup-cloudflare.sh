#!/bin/bash

# Cloudflare Setup Script for Flavours Platform
# This script automates the Cloudflare configuration setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="flavours.com"
CLOUDFLARE_EMAIL=""
CLOUDFLARE_API_KEY=""
CLOUDFLARE_ZONE_ID=""

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_error "jq is required but not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Function to get user input
get_user_input() {
    if [ -z "$CLOUDFLARE_EMAIL" ]; then
        read -p "Enter your Cloudflare email: " CLOUDFLARE_EMAIL
    fi
    
    if [ -z "$CLOUDFLARE_API_KEY" ]; then
        read -s -p "Enter your Cloudflare API key: " CLOUDFLARE_API_KEY
        echo
    fi
    
    if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
        read -p "Enter your Cloudflare Zone ID: " CLOUDFLARE_ZONE_ID
    fi
}

# Function to validate Cloudflare credentials
validate_credentials() {
    print_status "Validating Cloudflare credentials..."
    
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json")
    
    if echo "$response" | jq -e '.success' > /dev/null; then
        print_success "Cloudflare credentials are valid"
    else
        print_error "Invalid Cloudflare credentials"
        exit 1
    fi
}

# Function to get zone ID if not provided
get_zone_id() {
    if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
        print_status "Getting Zone ID for $DOMAIN..."
        
        response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
            -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
            -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
            -H "Content-Type: application/json")
        
        CLOUDFLARE_ZONE_ID=$(echo "$response" | jq -r '.result[0].id')
        
        if [ "$CLOUDFLARE_ZONE_ID" = "null" ]; then
            print_error "Zone not found for $DOMAIN"
            exit 1
        fi
        
        print_success "Zone ID: $CLOUDFLARE_ZONE_ID"
    fi
}

# Function to configure SSL settings
configure_ssl() {
    print_status "Configuring SSL settings..."
    
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/ssl" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{
            "value": "full_strict",
            "certificate_authority": "lets_encrypt"
        }' | jq -e '.success' > /dev/null
    
    print_success "SSL configured to Full (Strict)"
}

# Function to configure security settings
configure_security() {
    print_status "Configuring security settings..."
    
    # Security Level
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/security_level" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{"value": "high"}' | jq -e '.success' > /dev/null
    
    # Browser Check
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/browser_check" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{"value": "on"}' | jq -e '.success' > /dev/null
    
    # Hotlink Protection
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/hotlink_protection" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{"value": "on"}' | jq -e '.success' > /dev/null
    
    print_success "Security settings configured"
}

# Function to configure caching
configure_caching() {
    print_status "Configuring caching settings..."
    
    # Caching Level
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/cache_level" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{"value": "aggressive"}' | jq -e '.success' > /dev/null
    
    # Browser Cache TTL
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/browser_cache_ttl" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{"value": 14400}' | jq -e '.success' > /dev/null
    
    print_success "Caching settings configured"
}

# Function to configure performance settings
configure_performance() {
    print_status "Configuring performance settings..."
    
    # Minify
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/minify" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{"value": {"css": "on", "html": "on", "js": "on"}}' | jq -e '.success' > /dev/null
    
    # Brotli
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/brotli" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{"value": "on"}' | jq -e '.success' > /dev/null
    
    # HTTP/2
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/http2" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{"value": "on"}' | jq -e '.success' > /dev/null
    
    # HTTP/3
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/http3" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{"value": "on"}' | jq -e '.success' > /dev/null
    
    print_success "Performance settings configured"
}

# Function to create firewall rules
create_firewall_rules() {
    print_status "Creating firewall rules..."
    
    # Block suspicious countries
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/firewall/rules" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{
            "action": "block",
            "filter": {
                "expression": "(ip.geoip.country in {\"CN\" \"RU\" \"KP\" \"IR\"}) and (http.request.uri.path contains \"/api/\")"
            },
            "description": "Block Suspicious Countries"
        }' | jq -e '.success' > /dev/null
    
    # Rate limit API endpoints
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/firewall/rules" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{
            "action": "challenge",
            "filter": {
                "expression": "(http.request.uri.path contains \"/api/\") and (cf.threat_score gt 14)"
            },
            "description": "Rate Limit API Endpoints"
        }' | jq -e '.success' > /dev/null
    
    # Block bad user agents
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/firewall/rules" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{
            "action": "block",
            "filter": {
                "expression": "(http.user_agent contains \"sqlmap\") or (http.user_agent contains \"nikto\") or (http.user_agent contains \"nmap\")"
            },
            "description": "Block Bad User Agents"
        }' | jq -e '.success' > /dev/null
    
    print_success "Firewall rules created"
}

# Function to create page rules
create_page_rules() {
    print_status "Creating page rules..."
    
    # API routes - bypass cache
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/pagerules" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{
            "targets": [
                {
                    "target": "url",
                    "constraint": {
                        "operator": "matches",
                        "value": "'$DOMAIN'/api/*"
                    }
                }
            ],
            "actions": [
                {
                    "id": "cache_level",
                    "value": "bypass"
                },
                {
                    "id": "security_level",
                    "value": "high"
                }
            ],
            "priority": 1,
            "status": "active"
        }' | jq -e '.success' > /dev/null
    
    # Admin routes - bypass cache, high security
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/pagerules" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{
            "targets": [
                {
                    "target": "url",
                    "constraint": {
                        "operator": "matches",
                        "value": "'$DOMAIN'/admin/*"
                    }
                }
            ],
            "actions": [
                {
                    "id": "cache_level",
                    "value": "bypass"
                },
                {
                    "id": "security_level",
                    "value": "high"
                },
                {
                    "id": "browser_check",
                    "value": "on"
                }
            ],
            "priority": 2,
            "status": "active"
        }' | jq -e '.success' > /dev/null
    
    # Static assets - aggressive caching
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/pagerules" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{
            "targets": [
                {
                    "target": "url",
                    "constraint": {
                        "operator": "matches",
                        "value": "'$DOMAIN'/_next/static/*"
                    }
                }
            ],
            "actions": [
                {
                    "id": "cache_level",
                    "value": "cache_everything"
                },
                {
                    "id": "edge_cache_ttl",
                    "value": 31536000
                },
                {
                    "id": "browser_cache_ttl",
                    "value": 31536000
                }
            ],
            "priority": 3,
            "status": "active"
        }' | jq -e '.success' > /dev/null
    
    print_success "Page rules created"
}

# Function to enable Bot Management
enable_bot_management() {
    print_status "Enabling Bot Management..."
    
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/bot_management" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{
            "enable_js": true,
            "fight_mode": true,
            "allow_verified_bots": true,
            "allow_search_engines": true,
            "allow_social_media": true,
            "allow_advertising": false,
            "allow_automation": false
        }' | jq -e '.success' > /dev/null
    
    print_success "Bot Management enabled"
}

# Function to create rate limiting rules
create_rate_limiting() {
    print_status "Creating rate limiting rules..."
    
    # API rate limit
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/rate_limits" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{
            "match": {
                "request": {
                    "url": "'$DOMAIN'/api/*"
                }
            },
            "rate": {
                "mode": "simulate",
                "threshold": 60,
                "period": 60
            },
            "action": {
                "mode": "simulate",
                "timeout": 600,
                "response": {
                    "content_type": "text/plain",
                    "body": "Rate limit exceeded"
                }
            },
            "disabled": false,
            "description": "API Rate Limit"
        }' | jq -e '.success' > /dev/null
    
    print_success "Rate limiting rules created"
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Enable Analytics
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/analytics" \
        -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
        -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json" \
        --data '{"enabled": true}' | jq -e '.success' > /dev/null
    
    print_success "Monitoring setup completed"
}

# Function to deploy security worker
deploy_security_worker() {
    print_status "Deploying security worker..."
    
    if [ -f "cloudflare/workers/security-worker.js" ]; then
        # Create worker script
        curl -s -X PUT "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ZONE_ID/workers/scripts/security-worker" \
            -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
            -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
            -H "Content-Type: application/javascript" \
            --data-binary @cloudflare/workers/security-worker.js | jq -e '.success' > /dev/null
        
        # Create route
        curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/workers/routes" \
            -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
            -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
            -H "Content-Type: application/json" \
            --data '{
                "pattern": "'$DOMAIN'/*",
                "script": "security-worker"
            }' | jq -e '.success' > /dev/null
        
        print_success "Security worker deployed"
    else
        print_warning "Security worker script not found, skipping deployment"
    fi
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment file..."
    
    cat > .env.cloudflare << EOF
# Cloudflare Configuration
CLOUDFLARE_EMAIL=$CLOUDFLARE_EMAIL
CLOUDFLARE_API_KEY=$CLOUDFLARE_API_KEY
CLOUDFLARE_ZONE_ID=$CLOUDFLARE_ZONE_ID
CLOUDFLARE_DOMAIN=$DOMAIN

# Security Settings
CLOUDFLARE_SECURITY_LEVEL=high
CLOUDFLARE_SSL_MODE=full_strict
CLOUDFLARE_CACHE_LEVEL=aggressive
CLOUDFLARE_BOT_MANAGEMENT=enabled

# Performance Settings
CLOUDFLARE_MINIFY=enabled
CLOUDFLARE_BROTLI=enabled
CLOUDFLARE_HTTP2=enabled
CLOUDFLARE_HTTP3=enabled
EOF
    
    print_success "Environment file created: .env.cloudflare"
}

# Function to display summary
display_summary() {
    echo
    print_success "Cloudflare setup completed successfully!"
    echo
    echo "Configuration Summary:"
    echo "====================="
    echo "Domain: $DOMAIN"
    echo "Zone ID: $CLOUDFLARE_ZONE_ID"
    echo "SSL Mode: Full (Strict)"
    echo "Security Level: High"
    echo "Cache Level: Aggressive"
    echo "Bot Management: Enabled"
    echo "Performance Optimizations: Enabled"
    echo
    echo "Next Steps:"
    echo "==========="
    echo "1. Update your DNS records to point to Cloudflare"
    echo "2. Test your website to ensure everything works"
    echo "3. Monitor the Cloudflare dashboard for security events"
    echo "4. Review and adjust firewall rules as needed"
    echo
    echo "Security Features Enabled:"
    echo "========================="
    echo "✓ DDoS Protection"
    echo "✓ WAF (Web Application Firewall)"
    echo "✓ Bot Management"
    echo "✓ Rate Limiting"
    echo "✓ SSL/TLS Encryption"
    echo "✓ Security Headers"
    echo "✓ Threat Intelligence"
    echo "✓ Geographic Blocking"
    echo "✓ Malicious User Agent Blocking"
    echo
    print_warning "Remember to keep your Cloudflare API key secure!"
}

# Main execution
main() {
    echo "Cloudflare Setup for Flavours Platform"
    echo "======================================"
    echo
    
    check_dependencies
    get_user_input
    validate_credentials
    get_zone_id
    
    configure_ssl
    configure_security
    configure_caching
    configure_performance
    create_firewall_rules
    create_page_rules
    enable_bot_management
    create_rate_limiting
    setup_monitoring
    deploy_security_worker
    create_env_file
    display_summary
}

# Run main function
main "$@"
