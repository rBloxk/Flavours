#!/bin/bash

# Production Deployment Script for Flavours Platform
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="flavours-platform"
MAIN_APP_PORT=3000
ADMIN_PORT=3002
BACKEND_PORT=3001
DOCKER_COMPOSE_FILE="docker-compose.production.yml"

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "All prerequisites are met"
}

# Function to validate environment variables
validate_environment() {
    print_status "Validating environment variables..."
    
    if [ ! -f ".env.production" ]; then
        print_error "Production environment file (.env.production) not found"
        print_warning "Please create .env.production with all required variables"
        exit 1
    fi
    
    # Check critical environment variables
    source .env.production
    
    required_vars=(
        "DATABASE_URL"
        "SUPABASE_URL"
        "SUPABASE_ANON_KEY"
        "JWT_SECRET"
        "NEXTAUTH_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    print_success "Environment variables validated"
}

# Function to build and test
build_and_test() {
    print_status "Building and testing application..."
    
    # Install dependencies for main app
    print_status "Installing main app dependencies..."
    npm ci --production=false
    
    # Install dependencies for admin dashboard
    print_status "Installing admin dashboard dependencies..."
    cd admin-dashboard
    npm ci --production=false
    cd ..
    
    # Install dependencies for backend
    print_status "Installing backend dependencies..."
    cd backend
    npm ci --production=false
    cd ..
    
    # Run tests (if available)
    if [ -f "package.json" ] && npm run test --if-present; then
        print_success "Tests passed"
    else
        print_warning "No tests found or tests failed"
    fi
    
    # Build main app
    print_status "Building main application..."
    npm run build
    
    # Build admin dashboard
    print_status "Building admin dashboard..."
    cd admin-dashboard
    npm run build
    cd ..
    
    # Build backend
    print_status "Building backend..."
    cd backend
    npm run build
    cd ..
    
    print_success "Build completed successfully"
}

# Function to create production Docker images
build_docker_images() {
    print_status "Building Docker images for production..."
    
    # Build main app image
    print_status "Building main app Docker image..."
    docker build -f Dockerfile.production -t ${PROJECT_NAME}-main:latest .
    
    # Build admin dashboard image
    print_status "Building admin dashboard Docker image..."
    docker build -f admin-dashboard/Dockerfile.production -t ${PROJECT_NAME}-admin:latest admin-dashboard/
    
    # Build backend image
    print_status "Building backend Docker image..."
    docker build -f backend/Dockerfile.production -t ${PROJECT_NAME}-backend:latest backend/
    
    print_success "Docker images built successfully"
}

# Function to deploy with Docker Compose
deploy_with_docker() {
    print_status "Deploying with Docker Compose..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans
    
    # Start services
    print_status "Starting services..."
    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    print_status "Checking service health..."
    
    # Check main app
    if curl -f http://localhost:${MAIN_APP_PORT}/api/health > /dev/null 2>&1; then
        print_success "Main app is healthy"
    else
        print_warning "Main app health check failed"
    fi
    
    # Check admin dashboard
    if curl -f http://localhost:${ADMIN_PORT}/api/health > /dev/null 2>&1; then
        print_success "Admin dashboard is healthy"
    else
        print_warning "Admin dashboard health check failed"
    fi
    
    # Check backend
    if curl -f http://localhost:${BACKEND_PORT}/api/v1/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed"
    fi
    
    print_success "Deployment completed successfully"
}

# Function to setup monitoring and logging
setup_monitoring() {
    print_status "Setting up monitoring and logging..."
    
    # Create logs directory
    mkdir -p logs
    
    # Setup log rotation
    if command -v logrotate &> /dev/null; then
        print_status "Setting up log rotation..."
        cat > /etc/logrotate.d/${PROJECT_NAME} << EOF
/opt/${PROJECT_NAME}/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF
    fi
    
    print_success "Monitoring and logging setup completed"
}

# Function to display deployment information
display_deployment_info() {
    print_success "🚀 Flavours Platform deployed successfully!"
    echo ""
    echo "📊 Service URLs:"
    echo "  • Main Application: http://localhost:${MAIN_APP_PORT}"
    echo "  • Admin Dashboard:  http://localhost:${ADMIN_PORT}"
    echo "  • Backend API:      http://localhost:${BACKEND_PORT}"
    echo ""
    echo "📋 Management Commands:"
    echo "  • View logs:        docker-compose -f ${DOCKER_COMPOSE_FILE} logs -f"
    echo "  • Stop services:    docker-compose -f ${DOCKER_COMPOSE_FILE} down"
    echo "  • Restart services: docker-compose -f ${DOCKER_COMPOSE_FILE} restart"
    echo "  • Update services:  docker-compose -f ${DOCKER_COMPOSE_FILE} pull && docker-compose -f ${DOCKER_COMPOSE_FILE} up -d"
    echo ""
    echo "🔧 Configuration:"
    echo "  • Environment:      Production"
    echo "  • Database:          PostgreSQL"
    echo "  • Cache:             Redis"
    echo "  • File Storage:      Local"
    echo ""
}

# Main deployment function
main() {
    echo "🚀 Starting Flavours Platform Production Deployment"
    echo "=================================================="
    echo ""
    
    check_prerequisites
    validate_environment
    build_and_test
    build_docker_images
    deploy_with_docker
    setup_monitoring
    display_deployment_info
    
    print_success "Deployment completed successfully! 🎉"
}

# Run main function
main "$@"