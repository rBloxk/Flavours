#!/bin/bash

# Flavours Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="flavours"
ENVIRONMENT=${1:-production}
REGION=${2:-us-east-1}
DOMAIN=${3:-flavours.club}

echo -e "${BLUE}🚀 Starting Flavours Production Deployment${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo -e "${BLUE}Domain: ${DOMAIN}${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}🔍 Checking dependencies...${NC}"
    
    local missing_deps=()
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    if ! command -v kubectl &> /dev/null; then
        missing_deps+=("kubectl")
    fi
    
    if ! command -v helm &> /dev/null; then
        missing_deps+=("helm")
    fi
    
    if ! command -v aws &> /dev/null; then
        missing_deps+=("aws-cli")
    fi
    
    if ! command -v firebase &> /dev/null; then
        missing_deps+=("firebase-tools")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_status "All dependencies are installed"
}

# Validate environment variables
validate_env() {
    echo -e "${BLUE}🔍 Validating environment variables...${NC}"
    
    local required_vars=(
        "SUPABASE_URL"
        "SUPABASE_SERVICE_ROLE_KEY"
        "JWT_SECRET"
        "STRIPE_SECRET_KEY"
        "REDIS_URL"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables: ${missing_vars[*]}"
        echo "Please set these variables in your environment or .env file."
        exit 1
    fi
    
    print_status "Environment variables validated"
}

# Build Docker images
build_images() {
    echo -e "${BLUE}🐳 Building Docker images...${NC}"
    
    # Build backend image
    echo "Building backend image..."
    docker build -t ${PROJECT_NAME}/backend:latest -f backend/Dockerfile backend/
    print_status "Backend image built"
    
    # Build frontend image
    echo "Building frontend image..."
    docker build -t ${PROJECT_NAME}/frontend:latest -f Dockerfile .
    print_status "Frontend image built"
    
    # Tag images for registry
    docker tag ${PROJECT_NAME}/backend:latest ${PROJECT_NAME}/backend:${ENVIRONMENT}
    docker tag ${PROJECT_NAME}/frontend:latest ${PROJECT_NAME}/frontend:${ENVIRONMENT}
    
    print_status "Docker images built and tagged"
}

# Push images to registry
push_images() {
    echo -e "${BLUE}📤 Pushing images to registry...${NC}"
    
    # Configure Docker to use ECR (if using AWS)
    if [ "$ENVIRONMENT" = "production" ]; then
        aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com
        
        # Create ECR repositories if they don't exist
        aws ecr describe-repositories --repository-names ${PROJECT_NAME}-backend --region ${REGION} || \
        aws ecr create-repository --repository-name ${PROJECT_NAME}-backend --region ${REGION}
        
        aws ecr describe-repositories --repository-names ${PROJECT_NAME}-frontend --region ${REGION} || \
        aws ecr create-repository --repository-name ${PROJECT_NAME}-frontend --region ${REGION}
        
        # Push images
        docker tag ${PROJECT_NAME}/backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${PROJECT_NAME}-backend:latest
        docker tag ${PROJECT_NAME}/frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${PROJECT_NAME}-frontend:latest
        
        docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${PROJECT_NAME}-backend:latest
        docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${PROJECT_NAME}-frontend:latest
        
        print_status "Images pushed to ECR"
    else
        print_warning "Skipping image push for non-production environment"
    fi
}

# Deploy to Kubernetes
deploy_k8s() {
    echo -e "${BLUE}☸️  Deploying to Kubernetes...${NC}"
    
    # Create namespace
    kubectl create namespace ${PROJECT_NAME} --dry-run=client -o yaml | kubectl apply -f -
    print_status "Namespace created/updated"
    
    # Apply ConfigMaps
    kubectl apply -f k8s/configmap.yaml -n ${PROJECT_NAME}
    print_status "ConfigMaps applied"
    
    # Apply Secrets (you'll need to create these manually)
    print_warning "Please ensure secrets are created in Kubernetes:"
    echo "kubectl create secret generic app-secrets -n ${PROJECT_NAME} \\"
    echo "  --from-literal=database-url=\$SUPABASE_URL \\"
    echo "  --from-literal=redis-url=\$REDIS_URL \\"
    echo "  --from-literal=jwt-secret=\$JWT_SECRET \\"
    echo "  --from-literal=supabase-service-role-key=\$SUPABASE_SERVICE_ROLE_KEY \\"
    echo "  --from-literal=stripe-secret-key=\$STRIPE_SECRET_KEY"
    
    # Apply deployments
    kubectl apply -f k8s/backend.yaml -n ${PROJECT_NAME}
    kubectl apply -f k8s/frontend.yaml -n ${PROJECT_NAME}
    kubectl apply -f k8s/postgres.yaml -n ${PROJECT_NAME}
    print_status "Kubernetes deployments applied"
    
    # Wait for deployments to be ready
    echo "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/backend -n ${PROJECT_NAME}
    kubectl wait --for=condition=available --timeout=300s deployment/frontend -n ${PROJECT_NAME}
    print_status "Deployments are ready"
}

# Setup monitoring
setup_monitoring() {
    echo -e "${BLUE}📊 Setting up monitoring...${NC}"
    
    # Install Prometheus and Grafana using Helm
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo update
    
    # Install Prometheus
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        --namespace monitoring \
        --create-namespace \
        --set grafana.adminPassword=admin123 \
        --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
    
    print_status "Monitoring stack installed"
}

# Setup SSL certificates
setup_ssl() {
    echo -e "${BLUE}🔒 Setting up SSL certificates...${NC}"
    
    # Install cert-manager
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
    
    # Wait for cert-manager to be ready
    kubectl wait --for=condition=available --timeout=300s deployment/cert-manager -n cert-manager
    
    # Create ClusterIssuer for Let's Encrypt
    cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@${DOMAIN}
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
    
    print_status "SSL certificates configured"
}

# Run database migrations
run_migrations() {
    echo -e "${BLUE}🗄️  Running database migrations...${NC}"
    
    # Get backend pod name
    BACKEND_POD=$(kubectl get pods -n ${PROJECT_NAME} -l app=backend -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$BACKEND_POD" ]; then
        # Run migrations
        kubectl exec -n ${PROJECT_NAME} $BACKEND_POD -- npm run migrate
        print_status "Database migrations completed"
    else
        print_warning "Backend pod not found, skipping migrations"
    fi
}

# Health check
health_check() {
    echo -e "${BLUE}🏥 Performing health checks...${NC}"
    
    # Get service URLs
    BACKEND_URL=$(kubectl get service backend-service -n ${PROJECT_NAME} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    FRONTEND_URL=$(kubectl get service frontend-service -n ${PROJECT_NAME} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    
    if [ -n "$BACKEND_URL" ]; then
        # Check backend health
        if curl -f "http://${BACKEND_URL}:3001/health" > /dev/null 2>&1; then
            print_status "Backend health check passed"
        else
            print_error "Backend health check failed"
        fi
    fi
    
    if [ -n "$FRONTEND_URL" ]; then
        # Check frontend health
        if curl -f "http://${FRONTEND_URL}:3000" > /dev/null 2>&1; then
            print_status "Frontend health check passed"
        else
            print_error "Frontend health check failed"
        fi
    fi
}

# Main deployment function
main() {
    echo -e "${BLUE}🚀 Starting Flavours Production Deployment${NC}"
    echo "=================================================="
    
    check_dependencies
    validate_env
    build_images
    push_images
    deploy_k8s
    setup_monitoring
    setup_ssl
    run_migrations
    health_check
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "1. Verify all services are running: kubectl get pods -n ${PROJECT_NAME}"
    echo "2. Check service URLs: kubectl get services -n ${PROJECT_NAME}"
    echo "3. Monitor logs: kubectl logs -f deployment/backend -n ${PROJECT_NAME}"
    echo "4. Access Grafana: kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring"
    echo ""
    echo -e "${BLUE}🔗 Access URLs:${NC}"
    echo "Frontend: https://${DOMAIN}"
    echo "Backend API: https://api.${DOMAIN}"
    echo "Grafana: https://monitoring.${DOMAIN}"
    echo ""
}

# Run main function
main "$@"
