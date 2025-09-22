# Flavours Backend API

A comprehensive, production-ready backend API for the Flavours Creator Monetization Platform built with Node.js, Express, TypeScript, and Supabase.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete user profiles, creator verification, and KYC
- **Content Management**: Posts, media uploads, interactions, and moderation
- **Payment Processing**: Stripe integration for subscriptions, tips, and pay-per-view
- **Real-time Features**: WebSocket support for live chat, notifications, and streaming

### Advanced Features
- **Live Streaming (Cams)**: Complete streaming platform with viewer management, chat, gifts, and analytics
- **Anonymous Chat (FlavoursTalk)**: Random matching, anonymous messaging, and safety features
- **Analytics Dashboard**: Comprehensive analytics for creators and platform administrators
- **Notification System**: Real-time notifications with email, push, and SMS support
- **Content Moderation**: AI-powered content filtering and manual review workflows

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Supabase
- **Cache**: Redis for session management and real-time data
- **Authentication**: Supabase Auth with JWT
- **File Storage**: MinIO/S3-compatible storage
- **Real-time**: Socket.io for WebSocket connections
- **Monitoring**: Prometheus, Grafana, and ELK stack
- **Security**: Helmet, CORS, rate limiting, and input validation

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Supabase account
- Stripe account (for payments)

## 🔧 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd flavours/backend
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

Required environment variables:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/flavours
REDIS_URL=redis://localhost:6379

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### 3. Database Setup

```bash
# Run migrations
npm run migrate

# Seed database (optional)
npm run seed
```

### 4. Start Development Server

```bash
# Start with Docker Compose (recommended)
docker-compose up -d

# Or start manually
npm run dev
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/v1/auth/signup
POST /api/v1/auth/signin
POST /api/v1/auth/signout
GET  /api/v1/auth/me
POST /api/v1/auth/verify-email
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

### Content Endpoints

```http
GET    /api/v1/content/                    # Get posts with pagination
POST   /api/v1/content/                    # Create new post
GET    /api/v1/content/:id                 # Get single post
PUT    /api/v1/content/:id                 # Update post
DELETE /api/v1/content/:id                 # Delete post
POST   /api/v1/content/:id/like            # Like/unlike post
POST   /api/v1/content/:id/save            # Save/unsave post
POST   /api/v1/content/:id/favorite        # Add to favorites
GET    /api/v1/content/feed/personalized   # Personalized feed
GET    /api/v1/content/search              # Search posts
GET    /api/v1/content/analytics/overview  # Content analytics
```

### Cams (Live Streaming) Endpoints

```http
POST   /api/v1/cams/streams                # Create stream
GET    /api/v1/cams/streams                # Get live streams
GET    /api/v1/cams/streams/:id            # Get stream details
PATCH  /api/v1/cams/streams/:id            # Update stream settings
POST   /api/v1/cams/streams/:id/start      # Start streaming
POST   /api/v1/cams/streams/:id/stop       # Stop streaming
POST   /api/v1/cams/streams/:id/join       # Join stream
POST   /api/v1/cams/streams/:id/leave      # Leave stream
GET    /api/v1/cams/streams/:id/viewers    # Get stream viewers
POST   /api/v1/cams/streams/gifts          # Send stream gift
GET    /api/v1/cams/streams/:id/chat       # Get stream chat
POST   /api/v1/cams/streams/:id/chat       # Send chat message
POST   /api/v1/cams/streams/:id/record     # Start recording
POST   /api/v1/cams/streams/:id/record/stop # Stop recording
GET    /api/v1/cams/streams/:id/analytics  # Stream analytics
```

### FlavoursTalk (Anonymous Chat) Endpoints

```http
POST   /api/v1/flavourstalk/sessions       # Create chat session
POST   /api/v1/flavourstalk/sessions/:id/match # Find match
GET    /api/v1/flavourstalk/sessions/active # Get active session
POST   /api/v1/flavourstalk/sessions/:id/end # End session
POST   /api/v1/flavourstalk/sessions/:id/skip # Skip match
POST   /api/v1/flavourstalk/sessions/messages # Send message
GET    /api/v1/flavourstalk/sessions/:id/messages # Get messages
POST   /api/v1/flavourstalk/sessions/report # Report user
POST   /api/v1/flavourstalk/sessions/:id/block # Block user
GET    /api/v1/flavourstalk/preferences    # Get preferences
PATCH  /api/v1/flavourstalk/preferences    # Update preferences
GET    /api/v1/flavourstalk/history        # Chat history
GET    /api/v1/flavourstalk/stats          # Chat statistics
```

### Notifications Endpoints

```http
GET    /api/v1/notifications/             # Get notifications
GET    /api/v1/notifications/unread-count  # Get unread count
PATCH  /api/v1/notifications/mark-read    # Mark as read
PATCH  /api/v1/notifications/mark-all-read # Mark all as read
DELETE /api/v1/notifications/:id           # Delete notification
GET    /api/v1/notifications/preferences  # Get preferences
PATCH  /api/v1/notifications/preferences  # Update preferences
POST   /api/v1/notifications/push/subscribe # Subscribe to push
DELETE /api/v1/notifications/push/unsubscribe # Unsubscribe
```

### Analytics Endpoints

```http
GET    /api/v1/analytics/platform          # Platform analytics (admin)
GET    /api/v1/analytics/creator           # Creator analytics
GET    /api/v1/analytics/content           # Content analytics
GET    /api/v1/analytics/revenue           # Revenue analytics
GET    /api/v1/analytics/audience          # Audience analytics
GET    /api/v1/analytics/engagement        # Engagement analytics
GET    /api/v1/analytics/streams           # Stream analytics
GET    /api/v1/analytics/chat              # Chat analytics
GET    /api/v1/analytics/realtime          # Real-time metrics
GET    /api/v1/analytics/dashboard         # Analytics dashboard
GET    /api/v1/analytics/export            # Export analytics data
```

### Payment Endpoints

```http
POST   /api/v1/payments/subscriptions      # Create subscription
GET    /api/v1/payments/subscriptions      # Get subscriptions
POST   /api/v1/payments/subscriptions/:id/cancel # Cancel subscription
POST   /api/v1/payments/tips               # Send tip
POST   /api/v1/payments/payouts            # Request payout
GET    /api/v1/payments/transactions       # Get transactions
POST   /api/v1/payments/webhooks/stripe    # Stripe webhook
```

## 🔌 WebSocket Events

### Authentication
```javascript
socket.emit('authenticate', token)
socket.on('authenticated', { userId })
socket.on('auth_error', { error })
```

### Live Streaming
```javascript
socket.emit('join_stream', streamId)
socket.emit('leave_stream', streamId)
socket.emit('stream_chat_message', { streamId, message })
socket.emit('send_stream_gift', { streamId, giftType, amount })
socket.on('stream_chat_message', message)
socket.on('stream_gift', gift)
socket.on('viewer_count_update', { count })
```

### Anonymous Chat
```javascript
socket.emit('join_chat_session', sessionId)
socket.emit('leave_chat_session', sessionId)
socket.emit('chat_message', { sessionId, message, type })
socket.emit('chat_typing_start', sessionId)
socket.emit('chat_typing_stop', sessionId)
socket.on('chat_message', message)
socket.on('chat_user_typing', { userId, typing })
```

### Notifications
```javascript
socket.emit('subscribe_notifications')
socket.emit('unsubscribe_notifications')
socket.on('notification', notification)
```

### Content Interactions
```javascript
socket.emit('toggle_post_like', postId)
socket.emit('join_post_room', postId)
socket.emit('leave_post_room', postId)
socket.on('post_like_update', { postId, liked, likesCount })
```

## 🏗 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── supabase.ts
│   │   └── production.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── rateLimiter.ts
│   │   ├── security.ts
│   │   └── errorHandler.ts
│   ├── routes/           # API routes
│   │   ├── auth.ts
│   │   ├── content.ts
│   │   ├── cams.ts
│   │   ├── flavourstalk.ts
│   │   ├── notifications.ts
│   │   ├── analytics.ts
│   │   └── payments.ts
│   ├── services/         # Business logic
│   │   ├── authService.ts
│   │   ├── contentService.ts
│   │   ├── camsService.ts
│   │   ├── flavourstalkService.ts
│   │   ├── notificationsService.ts
│   │   ├── analyticsService.ts
│   │   └── paymentService.ts
│   ├── schemas/          # Validation schemas
│   │   ├── auth.ts
│   │   ├── content.ts
│   │   ├── cams.ts
│   │   └── flavourstalk.ts
│   ├── websocket/        # WebSocket handlers
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   └── logger.ts
│   └── index.ts          # Main application file
├── logs/                 # Log files
├── uploads/              # File uploads
├── Dockerfile.production # Production Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Production Deployment

### Using Docker Compose

```bash
# Deploy to production
./scripts/deploy-production.sh
```

### Manual Deployment

```bash
# Build production image
docker build -f Dockerfile.production -t flavours-backend:latest .

# Run with environment variables
docker run -d \
  --name flavours-backend \
  -p 3001:3001 \
  --env-file .env.production \
  flavours-backend:latest
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/flavours
REDIS_URL=redis://host:6379
JWT_SECRET=your-production-jwt-secret
STRIPE_SECRET_KEY=sk_live_...
FRONTEND_URL=https://your-domain.com
```

## 📊 Monitoring & Observability

### Health Checks
- `GET /health` - Basic health check
- `GET /metrics` - Prometheus metrics

### Logging
- Structured JSON logging
- Log levels: error, warn, info, debug
- File rotation and compression
- Centralized logging with ELK stack

### Metrics
- Request/response times
- Error rates
- Database connection pool
- Redis cache hit rates
- WebSocket connections

### Alerting
- Error rate thresholds
- Response time thresholds
- Database connection failures
- High memory usage

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Per-IP and per-user limits
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CORS**: Configurable cross-origin policies
- **Helmet**: Security headers
- **HTTPS**: SSL/TLS encryption
- **Content Security Policy**: CSP headers

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries with proper indexes
- **Redis Caching**: Session and data caching
- **Connection Pooling**: Database connection management
- **Compression**: Gzip compression for responses
- **CDN**: Static asset delivery
- **Load Balancing**: Horizontal scaling support

## 🔧 Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript compiler
npm run migrate      # Run database migrations
npm run seed         # Seed database
```

### Code Style

- ESLint with TypeScript rules
- Prettier for code formatting
- Husky for git hooks
- Conventional commits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## 🔄 Changelog

### v1.0.0 (2024-01-15)
- Initial release
- Complete authentication system
- Content management APIs
- Live streaming (Cams) functionality
- Anonymous chat (FlavoursTalk) system
- Real-time notifications
- Comprehensive analytics
- Payment processing
- Production deployment setup


