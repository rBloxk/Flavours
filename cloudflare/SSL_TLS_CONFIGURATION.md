# SSL/TLS Configuration for Flavours Platform

## Overview

This document provides comprehensive SSL/TLS configuration for the Flavours platform using Cloudflare's SSL/TLS features and origin server configuration.

## Cloudflare SSL/TLS Settings

### 1. SSL Mode Configuration

#### Full (Strict) Mode
- **SSL Mode**: Full (Strict)
- **Certificate Authority**: Let's Encrypt
- **Minimum TLS Version**: 1.2
- **TLS 1.3**: Enabled
- **Always Use HTTPS**: Enabled

#### Configuration Steps
1. Go to SSL/TLS → Overview
2. Set SSL mode to "Full (Strict)"
3. Enable "Always Use HTTPS"
4. Enable "HTTP Strict Transport Security (HSTS)"

### 2. Edge Certificates

#### HSTS Configuration
```json
{
  "enabled": true,
  "max_age": 31536000,
  "include_subdomains": true,
  "preload": true
}
```

#### Certificate Settings
- **Universal SSL**: Enabled
- **Always Use HTTPS**: Enabled
- **HTTP Strict Transport Security**: Enabled
- **Minimum TLS Version**: 1.2
- **TLS 1.3**: Enabled
- **0-RTT Connection Resumption**: Enabled

### 3. Origin Certificates

#### Generate Origin Certificate
1. Go to SSL/TLS → Origin Server
2. Click "Create Certificate"
3. Select "Let Cloudflare generate a private key and a CSR"
4. Set hostnames: `flavours.club`, `*.flavours.club`
5. Set certificate validity: 15 years
6. Click "Create"

#### Install on Server
1. Copy the certificate content
2. Save as `cloudflare-origin.pem`
3. Copy the private key
4. Save as `cloudflare-origin.key`
5. Configure your web server

## Server-Side SSL Configuration

### 1. Nginx Configuration

#### SSL Configuration Block
```nginx
# SSL Configuration
ssl_certificate /etc/nginx/ssl/cloudflare-origin.pem;
ssl_certificate_key /etc/nginx/ssl/cloudflare-origin.key;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

#### Complete Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name flavours.club www.flavours.club;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cloudflare-origin.pem;
    ssl_certificate_key /etc/nginx/ssl/cloudflare-origin.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Client Max Body Size
    client_max_body_size 100M;

    # Health Check Endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # API Routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # WebSocket Routes
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket specific timeouts
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    # Static Files
    location /_next/static/ {
        proxy_pass http://frontend;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /static/ {
        proxy_pass http://frontend;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Upload Files
    location /uploads/ {
        proxy_pass http://backend;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Admin Routes
    location /admin/ {
        limit_req zone=login burst=10 nodelay;
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend Routes
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Error Pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name flavours.club www.flavours.club;
    return 301 https://$server_name$request_uri;
}
```

### 2. Apache Configuration

#### SSL Configuration Block
```apache
<VirtualHost *:443>
    ServerName flavours.club
    ServerAlias www.flavours.club

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/apache2/ssl/cloudflare-origin.pem
    SSLCertificateKeyFile /etc/apache2/ssl/cloudflare-origin.key
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384
    SSLHonorCipherOrder off
    SSLSessionTickets off

    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
    Header always set Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'"

    # Proxy Configuration
    ProxyPreserveHost On
    ProxyPass /api/ http://backend:3001/api/
    ProxyPassReverse /api/ http://backend:3001/api/
    ProxyPass / http://frontend:3000/
    ProxyPassReverse / http://frontend:3000/
</VirtualHost>

# Redirect HTTP to HTTPS
<VirtualHost *:80>
    ServerName flavours.club
    ServerAlias www.flavours.club
    Redirect permanent / https://flavours.club/
</VirtualHost>
```

### 3. Docker Configuration

#### Dockerfile SSL Setup
```dockerfile
FROM nginx:alpine

# Copy SSL certificates
COPY cloudflare-origin.pem /etc/nginx/ssl/
COPY cloudflare-origin.key /etc/nginx/ssl/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Set permissions
RUN chmod 600 /etc/nginx/ssl/cloudflare-origin.key
RUN chmod 644 /etc/nginx/ssl/cloudflare-origin.pem

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose SSL Configuration
```yaml
services:
  nginx:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./cloudflare-origin.pem:/etc/nginx/ssl/cloudflare-origin.pem:ro
      - ./cloudflare-origin.key:/etc/nginx/ssl/cloudflare-origin.key:ro
    depends_on:
      - frontend
      - backend
    networks:
      - flavours-network
```

## SSL Certificate Management

### 1. Certificate Renewal

#### Automatic Renewal
- Cloudflare handles edge certificate renewal automatically
- Origin certificates are valid for 15 years
- Monitor certificate expiration dates

#### Manual Renewal Process
1. Go to SSL/TLS → Origin Server
2. Click "Create Certificate" for renewal
3. Download new certificate
4. Update server configuration
5. Restart web server
6. Test SSL configuration

### 2. Certificate Validation

#### SSL Labs Test
- Visit https://www.ssllabs.com/ssltest/
- Enter your domain
- Check SSL rating (aim for A+)
- Review recommendations

#### Command Line Testing
```bash
# Test SSL connection
openssl s_client -connect flavours.club:443 -servername flavours.club

# Check certificate details
openssl x509 -in cloudflare-origin.pem -text -noout

# Verify certificate chain
openssl verify -CAfile ca-bundle.crt cloudflare-origin.pem
```

### 3. Certificate Monitoring

#### Monitoring Tools
- SSL Labs API
- Cloudflare Analytics
- Custom monitoring scripts
- Third-party monitoring services

#### Alert Configuration
- Certificate expiration alerts
- SSL configuration changes
- Security rating changes
- Performance impact monitoring

## Security Best Practices

### 1. Cipher Suite Configuration

#### Recommended Ciphers
```
ECDHE-RSA-AES256-GCM-SHA512
DHE-RSA-AES256-GCM-SHA512
ECDHE-RSA-AES256-GCM-SHA384
DHE-RSA-AES256-GCM-SHA384
ECDHE-RSA-AES256-SHA384
DHE-RSA-AES256-SHA384
ECDHE-RSA-AES128-GCM-SHA256
DHE-RSA-AES128-GCM-SHA256
ECDHE-RSA-AES128-SHA256
DHE-RSA-AES128-SHA256
```

#### Disabled Ciphers
- RC4
- DES
- 3DES
- MD5
- SHA1 (except for HMAC)

### 2. Protocol Configuration

#### Enabled Protocols
- TLS 1.2
- TLS 1.3

#### Disabled Protocols
- SSL 2.0
- SSL 3.0
- TLS 1.0
- TLS 1.1

### 3. Security Headers

#### Required Headers
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-XSS-Protection`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Content-Security-Policy`

#### Optional Headers
- `Permissions-Policy`
- `X-Permitted-Cross-Domain-Policies`
- `Cross-Origin-Embedder-Policy`
- `Cross-Origin-Opener-Policy`

## Performance Optimization

### 1. SSL Performance

#### Session Resumption
- Enable SSL session caching
- Use session tickets (if supported)
- Configure appropriate cache sizes

#### OCSP Stapling
- Enable OCSP stapling
- Configure OCSP responders
- Monitor OCSP response times

### 2. HTTP/2 and HTTP/3

#### HTTP/2 Configuration
- Enable HTTP/2
- Configure server push
- Optimize header compression

#### HTTP/3 Configuration
- Enable HTTP/3 (QUIC)
- Configure QUIC parameters
- Monitor QUIC performance

### 3. Compression

#### Brotli Compression
- Enable Brotli compression
- Configure compression levels
- Set appropriate file types

#### Gzip Compression
- Enable Gzip compression
- Configure compression levels
- Set appropriate file types

## Troubleshooting

### 1. Common SSL Issues

#### Certificate Errors
- Check certificate validity
- Verify certificate chain
- Ensure proper file permissions

#### Protocol Errors
- Verify TLS version support
- Check cipher suite compatibility
- Review protocol configuration

#### Performance Issues
- Monitor SSL handshake times
- Check certificate size
- Review cipher suite performance

### 2. Debugging Tools

#### SSL Testing Tools
- SSL Labs SSL Test
- Qualys SSL Test
- SSL Checker
- SSL Shopper

#### Command Line Tools
- OpenSSL
- cURL
- nmap
- ssldump

#### Browser Tools
- Chrome DevTools
- Firefox Developer Tools
- Safari Web Inspector

### 3. Monitoring and Alerting

#### Key Metrics
- SSL handshake time
- Certificate expiration
- Security rating
- Performance impact

#### Alert Configuration
- Certificate expiration alerts
- SSL configuration changes
- Security rating changes
- Performance degradation alerts

## Compliance and Standards

### 1. Industry Standards

#### PCI DSS
- Use strong encryption
- Implement proper key management
- Regular security assessments

#### HIPAA
- Encrypt data in transit
- Implement access controls
- Regular security audits

#### SOX
- Implement security controls
- Regular compliance audits
- Document security procedures

### 2. Regulatory Requirements

#### GDPR
- Implement data protection
- Use appropriate encryption
- Regular security assessments

#### CCPA
- Implement privacy controls
- Use appropriate encryption
- Regular security assessments

### 3. Security Frameworks

#### NIST Cybersecurity Framework
- Identify security requirements
- Protect critical assets
- Detect security events
- Respond to incidents
- Recover from attacks

#### ISO 27001
- Implement security controls
- Regular security assessments
- Continuous improvement

This comprehensive SSL/TLS configuration ensures your Flavours platform is secure, compliant, and performs optimally while maintaining the highest security standards.
