# Flavours - Creator Monetization Platform

A secure, scalable subscription-based creator monetization platform built with modern technologies.

## 🚀 Features

- **Creator Tools**: Content upload, subscription tiers, analytics dashboard
- **Fan Experience**: Browse creators, subscribe, tip, direct messaging
- **Trust & Safety**: Moderation dashboard, content policies, compliance
- **Payments**: Secure payment processing with multiple revenue streams
- **Real-time**: WebSocket-powered messaging and notifications
- **Admin Panel**: Platform management and analytics

## 🛠 Tech Stack

- **Frontend**: Next.js 13+, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Supabase
- **Real-time**: WebSocket (Socket.io)
- **Authentication**: Supabase Auth
- **Storage**: S3-compatible (MinIO)
- **Cache**: Redis
- **Infrastructure**: Docker, Kubernetes

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 15+
- Redis

## 🔧 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd flavours
```

### 2. Install dependencies
```bash
npm install
cd backend && npm install && cd ..
```

### 3. Set up environment variables
```bash
# Copy example environment files
cp .env.example .env.local
cp backend/.env.example backend/.env

# Update with your configuration
# - Supabase credentials
# - Database URLs
# - API keys
```

### 4. Start with Docker Compose (Recommended)
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Backend API (port 3001)
- Frontend app (port 3000)
- MinIO storage (port 9000/9001)

### 5. Or start manually
```bash
# Start database and cache
docker-compose up -d postgres redis minio

# Start backend
cd backend
npm run dev

# Start frontend (in another terminal)
npm run dev
```

## 🏗 Project Structure

```
flavours/
├── app/                    # Next.js 13+ app directory
│   ├── auth/              # Authentication pages
│   ├── creator/           # Creator dashboard
│   ├── admin/            # Admin panel
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── auth/            # Auth forms
│   ├── creator/         # Creator dashboard
│   ├── feed/           # Content feed
│   ├── moderation/     # Admin moderation
│   └── ui/             # shadcn/ui components
├── lib/                # Utilities and configurations
├── supabase/          # Database migrations
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── middleware/# Express middleware
│   │   ├── websocket/ # WebSocket handlers
│   │   └── utils/     # Utilities
│   └── Dockerfile
├── k8s/              # Kubernetes manifests
├── .github/          # CI/CD workflows
└── docker-compose.yml
```

## 🗄 Database Schema

Key tables:
- `profiles` - User profiles and basic info
- `creators` - Creator-specific data
- `posts` - Content posts
- `subscriptions` - User subscriptions to creators
- `transactions` - Payment records
- `messages` - Direct messaging
- `moderation_items` - Content moderation queue

See `supabase/migrations/` for complete schema.

## 🔒 Security Features

- Row Level Security (RLS) policies
- JWT authentication
- Rate limiting
- Input validation
- CORS configuration
- Content moderation
- Age verification
- Consent tracking

## 📊 Key APIs

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/signin` - User login
- `GET /api/v1/auth/me` - Current user info

### Content
- `GET /api/v1/content/feed` - Content feed
- `POST /api/v1/content/posts` - Create post
- `GET /api/v1/content/posts/:id` - Get post

### Subscriptions
- `POST /api/v1/subscriptions` - Subscribe to creator
- `GET /api/v1/subscriptions` - User subscriptions

### Messages
- WebSocket events for real-time messaging
- `GET /api/v1/messages/:userId` - Message history

## 🚀 Deployment

### Docker
```bash
# Build images
docker-compose build

# Deploy
docker-compose up -d
```

### Kubernetes
```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n flavours
```

### CI/CD
GitHub Actions workflow automatically:
1. Runs tests and linting
2. Builds Docker images
3. Pushes to container registry
4. Deploys to Kubernetes

## 📈 Monitoring

- Health checks at `/health`
- Structured logging with Winston
- Error tracking and alerting
- Performance metrics

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# E2E tests
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Documentation: [docs.flavours.app](https://docs.flavours.app)
- Issues: GitHub Issues
- Email: support@flavours.app