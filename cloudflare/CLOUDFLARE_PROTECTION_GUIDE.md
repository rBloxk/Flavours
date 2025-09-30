# Cloudflare Protection for Flavours Platform

## Overview

This document provides a comprehensive guide for implementing Cloudflare protection for the Flavours platform. Cloudflare offers multiple layers of security including DDoS protection, Web Application Firewall (WAF), Bot Management, and performance optimizations.

## Quick Start

### 1. Prerequisites

- Cloudflare account
- Domain registered and accessible
- Cloudflare API key
- Zone ID for your domain

### 2. Automated Setup

Run the automated setup script:

```bash
./scripts/setup-cloudflare.sh
```

The script will:
- Validate your Cloudflare credentials
- Configure SSL/TLS settings
- Set up security rules
- Configure caching and performance
- Deploy security worker
- Create monitoring alerts

### 3. Manual Configuration

If you prefer manual setup, follow the steps below:

## Manual Configuration Steps

### Step 1: DNS Configuration

1. **Add Domain to Cloudflare**
   - Log in to Cloudflare dashboard
   - Add your domain (e.g., `flavours.com`)
   - Choose the Free plan (upgrade as needed)

2. **Update Nameservers**
   - Copy the Cloudflare nameservers
   - Update your domain registrar's nameservers
   - Wait for DNS propagation (up to 24 hours)

3. **Configure DNS Records**
   ```
   Type: A
   Name: @
   Content: YOUR_SERVER_IP
   Proxy: Enabled (orange cloud)
   
   Type: A
   Name: www
   Content: YOUR_SERVER_IP
   Proxy: Enabled (orange cloud)
   
   Type: CNAME
   Name: api
   Content: YOUR_SERVER_IP
   Proxy: Enabled (orange cloud)
   ```

### Step 2: SSL/TLS Configuration

1. **SSL Mode**
   - Go to SSL/TLS → Overview
   - Set SSL mode to "Full (Strict)"
   - Enable "Always Use HTTPS"

2. **Edge Certificates**
   - Enable "HTTP Strict Transport Security (HSTS)"
   - Set Max Age to 1 year
   - Enable "Include SubDomains"
   - Enable "Preload"

3. **Origin Certificates**
   - Generate origin certificate
   - Install on your server
   - Configure your web server to use the certificate

### Step 3: Security Configuration

1. **Security Level**
   - Go to Security → Settings
   - Set Security Level to "High"
   - Enable "Browser Check"
   - Enable "Hotlink Protection"

2. **WAF Rules**
   - Go to Security → WAF
   - Enable "Cloudflare Managed Rules"
   - Enable "OWASP Core Rule Set"
   - Configure custom rules as needed

3. **Bot Management**
   - Go to Security → Bots
   - Enable "Bot Fight Mode"
   - Configure bot score thresholds
   - Allow verified bots and search engines

### Step 4: Firewall Rules

Create the following firewall rules:

1. **Block Suspicious Countries**
   ```
   Expression: (ip.geoip.country in {"CN" "RU" "KP" "IR"}) and (http.request.uri.path contains "/api/")
   Action: Block
   ```

2. **Rate Limit API Endpoints**
   ```
   Expression: (http.request.uri.path contains "/api/") and (cf.threat_score gt 14)
   Action: Challenge
   ```

3. **Block Bad User Agents**
   ```
   Expression: (http.user_agent contains "sqlmap") or (http.user_agent contains "nikto") or (http.user_agent contains "nmap")
   Action: Block
   ```

4. **Block Attack Patterns**
   ```
   Expression: (http.request.uri.query contains "<script") or (http.request.uri.query contains "union select") or (http.request.uri.query contains "../")
   Action: Block
   ```

### Step 5: Page Rules

Create the following page rules:

1. **API Routes**
   ```
   URL: flavours.com/api/*
   Settings:
   - Cache Level: Bypass
   - Security Level: High
   - Disable Apps: Yes
   ```

2. **Admin Routes**
   ```
   URL: flavours.com/admin/*
   Settings:
   - Cache Level: Bypass
   - Security Level: High
   - Browser Check: On
   - Disable Apps: Yes
   ```

3. **Static Assets**
   ```
   URL: flavours.com/_next/static/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 year
   - Browser Cache TTL: 1 year
   ```

4. **Upload Files**
   ```
   URL: flavours.com/uploads/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 30 days
   - Browser Cache TTL: 30 days
   ```

### Step 6: Rate Limiting

Configure rate limiting rules:

1. **API Rate Limit**
   - Endpoint: `/api/*`
   - Limit: 60 requests per minute
   - Action: Block for 10 minutes

2. **Login Rate Limit**
   - Endpoint: `/auth/login`
   - Limit: 5 requests per minute
   - Action: Block for 15 minutes

3. **Upload Rate Limit**
   - Endpoint: `/upload`
   - Limit: 10 requests per minute
   - Action: Block for 5 minutes

### Step 7: Performance Optimization

1. **Caching**
   - Go to Caching → Configuration
   - Set Caching Level to "Aggressive"
   - Set Browser Cache TTL to 4 hours

2. **Speed**
   - Go to Speed → Optimization
   - Enable "Auto Minify" for CSS, HTML, JS
   - Enable "Brotli"
   - Enable "HTTP/2"
   - Enable "HTTP/3"

3. **Image Optimization**
   - Enable "Polish"
   - Enable "WebP"
   - Enable "Mirage"

### Step 8: Security Worker Deployment

1. **Create Worker**
   - Go to Workers & Pages
   - Create new Worker
   - Name: `security-worker`
   - Copy code from `cloudflare/workers/security-worker.js`

2. **Configure Route**
   - Add route: `flavours.com/*`
   - Bind to security-worker

3. **Test Worker**
   - Verify worker is active
   - Test security features
   - Monitor logs

### Step 9: Monitoring and Alerts

1. **Analytics**
   - Go to Analytics → Web Analytics
   - Enable analytics
   - Set retention to 30 days

2. **Alerts**
   - Go to Notifications → Alerting
   - Create alerts for:
     - High threat score (>25)
     - DDoS attacks
     - Bot attacks
     - Rate limit exceeded

3. **Logs**
   - Enable Logpush
   - Configure log destinations
   - Set up log analysis

## Security Features

### DDoS Protection
- **L3/L4 DDoS**: Automatic mitigation
- **L7 DDoS**: Rate limiting + challenge
- **Advanced DDoS**: Custom rules

### WAF (Web Application Firewall)
- **OWASP Core Rule Set**: All rules enabled
- **Cloudflare Managed Rules**: All categories
- **Custom Rules**: SQL injection, XSS, CSRF protection

### Bot Management
- **Bot Fight Mode**: Enabled
- **Verified Bots**: Allowed
- **Search Engines**: Allowed
- **Social Media**: Allowed
- **Advertising**: Blocked
- **Automation**: Blocked

### Rate Limiting
- **Per-IP Limits**: Configurable
- **Endpoint Limits**: Specific to API/admin
- **Time Windows**: Adjustable
- **Actions**: Block, challenge, or log

### Geographic Blocking
- **Suspicious Countries**: Blocked
- **Tor Exit Nodes**: Blocked
- **VPN/Proxy**: Challenged
- **Trusted IPs**: Allowed

## Performance Features

### Caching
- **Static Assets**: 1 year cache
- **API Responses**: Bypass cache
- **Admin Pages**: Bypass cache
- **Upload Files**: 30 days cache

### Compression
- **Brotli**: Enabled
- **Gzip**: Enabled
- **Minification**: CSS, HTML, JS

### HTTP/3
- **HTTP/3**: Enabled
- **0-RTT**: Enabled
- **QUIC**: Enabled

## Monitoring and Analytics

### Security Metrics
- **Blocked Requests**: Track malicious requests
- **Threat Score**: Monitor threat levels
- **Bot Activity**: Track bot traffic
- **DDoS Attacks**: Monitor attack patterns

### Performance Metrics
- **Response Time**: Monitor latency
- **Cache Hit Ratio**: Track cache efficiency
- **Bandwidth**: Monitor data transfer
- **Uptime**: Track availability

### Custom Dashboards
- **Security Dashboard**: Real-time security metrics
- **Performance Dashboard**: Performance metrics
- **Traffic Dashboard**: Traffic patterns
- **Error Dashboard**: Error rates and types

## Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   - Check SSL mode setting
   - Verify origin certificate
   - Check certificate chain

2. **False Positives**
   - Adjust threat score thresholds
   - Review firewall rules
   - Check bot management settings

3. **Performance Issues**
   - Check cache settings
   - Review page rules
   - Monitor worker performance

4. **DNS Issues**
   - Verify nameserver settings
   - Check DNS propagation
   - Review DNS records

### Support Resources

- **Cloudflare Support**: https://support.cloudflare.com
- **Community Forums**: https://community.cloudflare.com
- **Documentation**: https://developers.cloudflare.com
- **Status Page**: https://www.cloudflarestatus.com

## Best Practices

### Security
- Regular security audits
- Monitor threat intelligence
- Update rules based on new threats
- Test security measures regularly

### Performance
- Optimize cache settings
- Monitor performance metrics
- Use appropriate page rules
- Test performance regularly

### Maintenance
- Review logs weekly
- Update configurations monthly
- Monitor alerts daily
- Document changes

## Compliance

### GDPR
- Data processing agreements
- Privacy policy updates
- User consent management
- Data retention policies

### Industry Standards
- OWASP guidelines
- Security best practices
- Regular audits
- Documentation requirements

## Cost Optimization

### Free Plan Features
- Basic DDoS protection
- Basic WAF
- Basic caching
- Basic analytics

### Paid Plan Benefits
- Advanced DDoS protection
- Advanced WAF
- Advanced caching
- Advanced analytics
- Priority support

### Usage Monitoring
- Monitor bandwidth usage
- Track request volume
- Monitor feature usage
- Optimize configurations

This comprehensive guide ensures your Flavours platform is protected with enterprise-grade security while maintaining optimal performance.

