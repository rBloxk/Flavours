# 🚀 Flavours Platform - Production Setup Guide

This guide provides comprehensive instructions for setting up the Flavours Creator Monetization Platform in a production environment.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Docker**: 20.x or higher
- **Docker Compose**: 2.x or higher
- **PostgreSQL**: 14.x or higher
- **Redis**: 6.x or higher

### Services Required
- **Supabase**: Database and authentication
- **Stripe**: Payment processing
- **Cloudflare**: CDN and security
- **Sentry**: Error monitoring
- **Google Analytics**: Analytics tracking

## ⚙️ Environment Configuration

### 1. Create Production Environment File

Create `.env.production` in the root directory:

```bash
# Production Environment Variables
NODE_ENV=production

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/flavours_production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# API Configuration
API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1

# File Storage
UPLOAD_MAX_SIZE=100MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/webm,audio/mpeg,audio/wav

# Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

# Email Service
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@your-domain.com
SMTP_PASS=your-email-password

# Redis Cache
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Security
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Content Moderation
OPENAI_API_KEY=your-openai-api-key
CONTENT_MODERATION_ENABLED=true

# Analytics
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
MIXPANEL_TOKEN=your-mixpanel-token
```

### 2. Configure Supabase

1. Create a new Supabase project
2. Run the database migrations:
   ```bash
   supabase db push
   ```
3. Set up Row Level Security (RLS) policies
4. Configure authentication settings
5. Set up storage buckets for media files

### 3. Configure Stripe

1. Create a Stripe account and get API keys
2. Set up webhook endpoints:
   - `https://your-domain.com/api/webhooks/stripe`
3. Configure payment methods and currencies
4. Set up subscription products

## 🗄️ Database Setup

### 1. PostgreSQL Configuration

```sql
-- Create database
CREATE DATABASE flavours_production;

-- Create user
CREATE USER flavours_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE flavours_production TO flavours_user;
```

### 2. Redis Configuration

```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Set password
requirepass your_redis_password

# Restart Redis
sudo systemctl restart redis-server
```

## 🔌 API Endpoints

### Main Application APIs

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Posts
- `GET /api/posts` - Get posts with pagination
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get specific post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `POST /api/posts/[id]/interact` - Like/bookmark post
- `GET /api/posts/[id]/comments` - Get post comments
- `POST /api/posts/comments` - Create comment

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/follow` - Follow/unfollow user
- `GET /api/users/[username]` - Get user by username

#### Storage
- `GET /api/storage/user` - Get user storage info
- `POST /api/storage/content` - Upload content
- `GET /api/storage/content` - Get user content
- `GET /api/storage/activity` - Get activity logs

### Admin Dashboard APIs

#### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

#### User Management
- `GET /api/admin/users` - Get users with filters
- `PUT /api/admin/users` - Update user status/role
- `DELETE /api/admin/users` - Delete user

#### Creator Management
- `GET /api/admin/creators` - Get creators
- `PUT /api/admin/creators` - Update creator status
- `POST /api/admin/creators/verify` - Verify creator

#### Moderation
- `GET /api/admin/moderation/queue` - Get moderation queue
- `POST /api/admin/moderation/approve` - Approve content
- `POST /api/admin/moderation/reject` - Reject content

#### Analytics
- `GET /api/admin/analytics/platform` - Platform analytics
- `GET /api/admin/analytics/creator` - Creator analytics
- `GET /api/admin/analytics/revenue` - Revenue analytics

## 🚀 Deployment

### Option 1: Docker Deployment (Recommended)

```bash
# Clone repository
git clone https://github.com/your-org/flavours-platform.git
cd flavours-platform

# Make deployment script executable
chmod +x scripts/deploy-production.sh

# Run deployment
./scripts/deploy-production.sh
```

### Option 2: Manual Deployment

```bash
# Install dependencies
npm ci --production=false
cd admin-dashboard && npm ci --production=false && cd ..
cd backend && npm ci --production=false && cd ..

# Build applications
npm run build
cd admin-dashboard && npm run build && cd ..
cd backend && npm run build && cd ..

# Start services
npm run start &
cd admin-dashboard && npm run start &
cd backend && npm run start &
```

### Option 3: Kubernetes Deployment

```bash
# Apply Kubernetes configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

## 📊 Monitoring

### 1. Health Checks

```bash
# Check main app health
curl http://localhost:3000/api/health

# Check admin dashboard health
curl http://localhost:3002/api/health

# Check backend health
curl http://localhost:3001/api/v1/health
```

### 2. Log Monitoring

```bash
# View application logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f admin-dashboard
```

### 3. Performance Monitoring

- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior and traffic analysis
- **Mixpanel**: Event tracking and user analytics
- **New Relic**: Application performance monitoring

## 🔒 Security

### 1. SSL/TLS Configuration

```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
}
```

### 2. Rate Limiting

The platform includes built-in rate limiting:
- **Authentication**: 5 attempts per 15 minutes
- **API Calls**: 100 requests per 15 minutes
- **File Uploads**: 10 uploads per hour
- **Comments**: 5 comments per minute

### 3. Content Security Policy

```javascript
// CSP configuration
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check database connection
psql -h localhost -U flavours_user -d flavours_production

# Check database status
sudo systemctl status postgresql
```

#### 2. Redis Connection Issues

```bash
# Check Redis connection
redis-cli ping

# Check Redis status
sudo systemctl status redis-server
```

#### 3. Port Conflicts

```bash
# Check port usage
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :3002

# Kill processes using ports
sudo kill -9 $(sudo lsof -t -i:3000)
```

#### 4. Memory Issues

```bash
# Check memory usage
free -h
docker stats

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
```

#### 2. Caching Strategy

- **Redis**: Session storage and API response caching
- **CDN**: Static asset delivery
- **Browser**: Client-side caching with proper headers

#### 3. Image Optimization

- **WebP Format**: Automatic image format conversion
- **Lazy Loading**: Images load only when needed
- **Responsive Images**: Multiple sizes for different devices

## 📞 Support

For production support and issues:

- **Documentation**: [docs.flavours.club](https://docs.flavours.club)
- **Support Email**: support@flavours.club
- **Discord**: [Flavours Community](https://discord.gg/flavours)
- **GitHub Issues**: [Report Issues](https://github.com/your-org/flavours-platform/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎉 Congratulations! Your Flavours Platform is now ready for production!**
