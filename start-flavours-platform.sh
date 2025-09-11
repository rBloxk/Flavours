#!/bin/bash

echo "🚀 Starting Flavours Creator Platform"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop first."
    exit 1
fi

print_status "Starting backend services (PostgreSQL, Redis, Backend API)..."
docker-compose up -d postgres redis backend

# Wait for backend to be ready
print_status "Waiting for backend services to start..."
sleep 15

# Check if backend is responding
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "Backend API is running on http://localhost:3001"
else
    print_warning "Backend API may not be fully ready yet"
fi

print_status "Starting main frontend application..."
cd /Users/rishalbabu/Documents/GitHub/Flavours
npm run dev &
FRONTEND_PID=$!

print_status "Starting admin dashboard..."
cd admin-dashboard
npm run dev &
ADMIN_PID=$!

# Wait a moment for services to start
sleep 10

echo ""
echo "🎉 Flavours Platform is now running!"
echo "===================================="
echo ""
print_success "Main Application: http://localhost:3000"
print_success "Admin Dashboard:  http://localhost:3002"
print_success "Backend API:      http://localhost:3001"
print_success "Database:         PostgreSQL on port 5432"
print_success "Cache:            Redis on port 6379"
echo ""
echo "📊 Admin Dashboard Features:"
echo "  • User and Creator Management"
echo "  • Content Moderation Queue"
echo "  • Analytics and Reporting"
echo "  • System Health Monitoring"
echo "  • Revenue Tracking"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    print_status "Stopping services..."
    kill $FRONTEND_PID 2>/dev/null
    kill $ADMIN_PID 2>/dev/null
    docker-compose down
    print_success "All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep the script running
wait
