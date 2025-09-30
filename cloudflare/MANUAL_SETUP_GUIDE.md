# Manual Cloudflare Setup Guide (No API Required)

## Step-by-Step Manual Configuration

### 1. Add Domain to Cloudflare
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click "Add a Site"
3. Enter your domain (e.g., `flavours.com`)
4. Choose the **Free plan** (sufficient for most needs)
5. Review DNS records and click "Continue"

### 2. Update Nameservers
1. Copy the Cloudflare nameservers (e.g., `alex.ns.cloudflare.com`, `beth.ns.cloudflare.com`)
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Update nameservers to Cloudflare's nameservers
4. Wait for DNS propagation (up to 24 hours)

### 3. Configure DNS Records
In Cloudflare DNS settings, add these records:

```
Type: A
Name: @
Content: YOUR_SERVER_IP
Proxy: Enabled (orange cloud)

Type: A  
Name: www
Content: YOUR_SERVER_IP
Proxy: Enabled (orange cloud)

Type: A
Name: api
Content: YOUR_SERVER_IP
Proxy: Enabled (orange cloud)
```

### 4. SSL/TLS Configuration
1. Go to **SSL/TLS** → **Overview**
2. Set SSL mode to **"Full (Strict)"**
3. Enable **"Always Use HTTPS"**
4. Go to **SSL/TLS** → **Edge Certificates**
5. Enable **"HTTP Strict Transport Security (HSTS)"**
6. Set Max Age to **1 year**
7. Enable **"Include SubDomains"**
8. Enable **"Preload"**

### 5. Security Settings
1. Go to **Security** → **Settings**
2. Set Security Level to **"High"**
3. Enable **"Browser Check"**
4. Enable **"Hotlink Protection"**

### 6. WAF Configuration
1. Go to **Security** → **WAF**
2. Enable **"Cloudflare Managed Rules"**
3. Enable **"OWASP Core Rule Set"**
4. Set both to **"Block"** mode

### 7. Bot Management
1. Go to **Security** → **Bots**
2. Enable **"Bot Fight Mode"**
3. Allow **"Verified Bots"**
4. Allow **"Search Engines"**
5. Allow **"Social Media"**
6. Block **"Advertising"**
7. Block **"Automation"**

### 8. Firewall Rules
Go to **Security** → **Firewall Rules** and create these rules:

#### Rule 1: Block Suspicious Countries
- **Expression**: `(ip.geoip.country in {"CN" "RU" "KP" "IR"}) and (http.request.uri.path contains "/api/")`
- **Action**: Block

#### Rule 2: Rate Limit API
- **Expression**: `(http.request.uri.path contains "/api/") and (cf.threat_score gt 14)`
- **Action**: Challenge

#### Rule 3: Block Bad User Agents
- **Expression**: `(http.user_agent contains "sqlmap") or (http.user_agent contains "nikto") or (http.user_agent contains "nmap")`
- **Action**: Block

### 9. Page Rules
Go to **Rules** → **Page Rules** and create:

#### Rule 1: API Routes
- **URL**: `flavours.com/api/*`
- **Settings**:
  - Cache Level: Bypass
  - Security Level: High
  - Disable Apps: Yes

#### Rule 2: Admin Routes
- **URL**: `flavours.com/admin/*`
- **Settings**:
  - Cache Level: Bypass
  - Security Level: High
  - Browser Check: On

#### Rule 3: Static Assets
- **URL**: `flavours.com/_next/static/*`
- **Settings**:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 year
  - Browser Cache TTL: 1 year

### 10. Caching Configuration
1. Go to **Caching** → **Configuration**
2. Set Caching Level to **"Aggressive"**
3. Set Browser Cache TTL to **4 hours**

### 11. Speed Optimization
1. Go to **Speed** → **Optimization**
2. Enable **"Auto Minify"** for CSS, HTML, JS
3. Enable **"Brotli"**
4. Enable **"HTTP/2"**
5. Enable **"HTTP/3"**

### 12. Analytics
1. Go to **Analytics** → **Web Analytics**
2. Enable **"Web Analytics"**
3. Set retention to **30 days**

## Benefits of Manual Setup
- ✅ No API credentials required
- ✅ Full control over each setting
- ✅ Visual interface for easy management
- ✅ Can be done by anyone with dashboard access
- ✅ Immediate configuration changes

## Time Required
- **Setup Time**: 30-45 minutes
- **DNS Propagation**: Up to 24 hours
- **Full Protection**: Immediate after DNS propagation

This manual approach gives you complete control and doesn't require any API setup!
