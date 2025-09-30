# Cloudflare Security Rules for Flavours Platform

This document outlines the comprehensive security rules and configurations implemented for the Flavours platform using Cloudflare.

## Overview

The Flavours platform is protected by multiple layers of Cloudflare security features:

- **Web Application Firewall (WAF)**
- **DDoS Protection**
- **Bot Management**
- **Rate Limiting**
- **Geographic Blocking**
- **SSL/TLS Security**
- **Custom Security Worker**

## Security Rules Configuration

### 1. Firewall Rules

#### Block Suspicious Countries
```json
{
  "name": "Block Suspicious Countries",
  "expression": "(ip.geoip.country in {\"CN\" \"RU\" \"KP\" \"IR\"}) and (http.request.uri.path contains \"/api/\")",
  "action": "block"
}
```

#### Rate Limit API Endpoints
```json
{
  "name": "Rate Limit API Endpoints",
  "expression": "(http.request.uri.path contains \"/api/\") and (cf.threat_score gt 14)",
  "action": "challenge"
}
```

#### Block Admin Brute Force
```json
{
  "name": "Block Admin Brute Force",
  "expression": "(http.request.uri.path contains \"/admin/\") and (cf.threat_score gt 10)",
  "action": "block"
}
```

#### Block Bad User Agents
```json
{
  "name": "Block Bad User Agents",
  "expression": "(http.user_agent contains \"sqlmap\") or (http.user_agent contains \"nikto\") or (http.user_agent contains \"nmap\")",
  "action": "block"
}
```

#### Block Common Attack Patterns
```json
{
  "name": "Block Common Attack Patterns",
  "expression": "(http.request.uri.query contains \"<script\") or (http.request.uri.query contains \"union select\") or (http.request.uri.query contains \"../\")",
  "action": "block"
}
```

### 2. Rate Limiting Rules

#### API Rate Limit
- **Endpoint**: `/api/*`
- **Limit**: 60 requests per minute
- **Action**: Block for 10 minutes

#### Login Rate Limit
- **Endpoint**: `/auth/login`
- **Limit**: 5 requests per minute
- **Action**: Block for 15 minutes

#### Upload Rate Limit
- **Endpoint**: `/upload`
- **Limit**: 10 requests per minute
- **Action**: Block for 5 minutes

### 3. Bot Management

#### Configuration
- **Enabled**: Yes
- **Challenge Suspicious Bots**: Yes
- **Allow Verified Bots**: Yes
- **Allow Search Engines**: Yes
- **Allow Social Media**: Yes
- **Allow Advertising**: No
- **Allow Automation**: No

#### Bot Score Thresholds
- **Score 0-30**: Allow
- **Score 31-50**: Challenge
- **Score 51-100**: Block

### 4. DDoS Protection

#### Configuration
- **Enabled**: Yes
- **Level**: High
- **Automatic Mitigation**: Yes
- **Notifications**: Yes

#### Protection Levels
- **L3/L4 DDoS**: Automatic mitigation
- **L7 DDoS**: Rate limiting + challenge
- **Advanced DDoS**: Custom rules

### 5. WAF Rules

#### OWASP Core Rule Set
- **Status**: Enabled
- **Mode**: Block
- **Rules**: All OWASP rules active

#### Cloudflare Managed Rules
- **Status**: Enabled
- **Mode**: Block
- **Categories**: All security categories

#### Custom Rules
- **SQL Injection Protection**: Enabled
- **XSS Protection**: Enabled
- **CSRF Protection**: Enabled
- **Path Traversal Protection**: Enabled

### 6. Access Rules

#### Block Tor Exit Nodes
```json
{
  "name": "Block Tor Exit Nodes",
  "expression": "cf.tor_guard eq true",
  "action": "block"
}
```

#### Block VPN/Proxy
```json
{
  "name": "Block VPN/Proxy",
  "expression": "cf.threat_score gt 20",
  "action": "challenge"
}
```

#### Allow Trusted IPs
```json
{
  "name": "Allow Trusted IPs",
  "expression": "ip.src in {192.168.1.0/24 10.0.0.0/8}",
  "action": "allow"
}
```

## Page Rules Configuration

### 1. API Routes
- **URL**: `flavours.club/api/*`
- **Cache Level**: Bypass
- **Security Level**: High
- **Apps**: Disabled

### 2. Admin Routes
- **URL**: `flavours.club/admin/*`
- **Cache Level**: Bypass
- **Security Level**: High
- **Browser Check**: Enabled
- **Apps**: Disabled

### 3. Static Assets
- **URL**: `flavours.club/_next/static/*`
- **Cache Level**: Cache Everything
- **Edge Cache TTL**: 1 year
- **Browser Cache TTL**: 1 year

### 4. Upload Files
- **URL**: `flavours.club/uploads/*`
- **Cache Level**: Cache Everything
- **Edge Cache TTL**: 30 days
- **Browser Cache TTL**: 30 days

## SSL/TLS Configuration

### SSL Settings
- **SSL Mode**: Full (Strict)
- **Certificate Authority**: Let's Encrypt
- **Minimum TLS Version**: 1.2
- **TLS 1.3**: Enabled
- **Always Use HTTPS**: Enabled

### HSTS Settings
- **Enabled**: Yes
- **Max Age**: 1 year
- **Include Subdomains**: Yes
- **Preload**: Yes

## Security Headers

### Request Headers
- `X-Forwarded-Proto`: https
- `X-Real-IP`: CF-Connecting-IP
- `X-Forwarded-For`: CF-Connecting-IP

### Response Headers
- `X-Frame-Options`: SAMEORIGIN
- `X-Content-Type-Options`: nosniff
- `X-XSS-Protection`: 1; mode=block
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Permissions-Policy`: camera=(), microphone=(), geolocation=()
- `Strict-Transport-Security`: max-age=31536000; includeSubDomains; preload

### Content Security Policy
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
media-src 'self' https: blob:;
connect-src 'self' https: wss:;
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
```

## Custom Security Worker

The security worker provides additional protection by:

1. **Threat Detection**
   - High threat score blocking
   - Bot activity detection
   - Suspicious country blocking

2. **Attack Pattern Detection**
   - SQL injection attempts
   - XSS attempts
   - Path traversal attempts
   - Command injection attempts

3. **Rate Limiting**
   - Per-IP rate limiting
   - Endpoint-specific limits
   - KV storage for persistence

4. **Security Headers**
   - Automatic header injection
   - CSP enforcement
   - HSTS implementation

## Monitoring and Alerting

### Analytics
- **Enabled**: Yes
- **Retention**: 30 days
- **Metrics**: All security metrics

### Alerts
- **High Threat Score**: Score > 25
- **DDoS Attack**: Score > 50
- **Bot Attack**: Score > 30
- **Rate Limit Exceeded**: Per endpoint
- **Security Rule Triggered**: All rules

## Implementation Steps

1. **Run Setup Script**
   ```bash
   ./scripts/setup-cloudflare.sh
   ```

2. **Configure DNS**
   - Point domain to Cloudflare nameservers
   - Enable proxy (orange cloud)

3. **Verify Configuration**
   - Check SSL certificate
   - Test security rules
   - Monitor dashboard

4. **Customize Rules**
   - Adjust thresholds as needed
   - Add custom rules for specific threats
   - Monitor and optimize

## Security Best Practices

### Regular Maintenance
- Review security logs weekly
- Update rules based on new threats
- Monitor performance impact
- Test security measures regularly

### Incident Response
- Set up alerts for critical events
- Have response procedures ready
- Document security incidents
- Learn from attacks

### Compliance
- Ensure GDPR compliance
- Follow industry standards
- Document security measures
- Regular security audits

## Troubleshooting

### Common Issues
1. **False Positives**: Adjust threat score thresholds
2. **Performance Impact**: Optimize rules and caching
3. **Blocked Legitimate Users**: Review geographic rules
4. **SSL Issues**: Check certificate configuration

### Support
- Cloudflare Support Portal
- Community Forums
- Documentation
- Professional Services

## Security Metrics

### Key Performance Indicators
- **Blocked Requests**: Track blocked malicious requests
- **False Positives**: Monitor legitimate user blocks
- **Response Time**: Ensure performance isn't impacted
- **Uptime**: Monitor service availability

### Reporting
- Weekly security reports
- Monthly threat analysis
- Quarterly security reviews
- Annual security audit

This comprehensive security configuration provides robust protection for the Flavours platform while maintaining optimal performance and user experience.
