# Cloudflare Terraform Setup

## Prerequisites
- Terraform installed
- Cloudflare API token
- Domain added to Cloudflare

## Setup Steps

### 1. Install Terraform
```bash
# macOS
brew install terraform

# Ubuntu/Debian
sudo apt-get update && sudo apt-get install terraform

# Or download from https://terraform.io/downloads
```

### 2. Get Cloudflare API Token
1. Go to Cloudflare Dashboard → My Profile → API Tokens
2. Create API token with Zone:Edit permissions
3. Copy the token

### 3. Configure Terraform
```bash
cd cloudflare/terraform
```

Create `terraform.tfvars`:
```hcl
cloudflare_api_token = "your-api-token-here"
domain = "flavours.com"
```

### 4. Initialize and Apply
```bash
terraform init
terraform plan
terraform apply
```

## Benefits
- Infrastructure as Code
- Version controlled configuration
- Reproducible deployments
- Easy to modify and update

