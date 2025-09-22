#!/bin/bash

# Flavours GCP Production Deployment Script
# This script handles the complete deployment process to Google Cloud Platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="flavours"
PROJECT_ID="flavours-production"
ENVIRONMENT=${1:-production}
REGION=${2:-us-central1}
ZONE=${3:-us-central1-a}
DOMAIN=${4:-flavours.club}

echo -e "${BLUE}🚀 Starting Flavours GCP Production Deployment${NC}"
echo -e "${BLUE}Project ID: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo -e "${BLUE}Zone: ${ZONE}${NC}"
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
    
    if ! command -v gcloud &> /dev/null; then
        missing_deps+=("gcloud")
    fi
    
    if ! command -v kubectl &> /dev/null; then
        missing_deps+=("kubectl")
    fi
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
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

# Authenticate with GCP
authenticate_gcp() {
    echo -e "${BLUE}🔐 Authenticating with Google Cloud...${NC}"
    
    # Set the project
    gcloud config set project ${PROJECT_ID}
    
    # Authenticate
    gcloud auth login
    gcloud auth configure-docker
    
    print_status "GCP authentication completed"
}

# Enable required APIs
enable_apis() {
    echo -e "${BLUE}🔧 Enabling required GCP APIs...${NC}"
    
    local apis=(
        "container.googleapis.com"
        "cloudbuild.googleapis.com"
        "containerregistry.googleapis.com"
        "sqladmin.googleapis.com"
        "storage-api.googleapis.com"
        "monitoring.googleapis.com"
        "logging.googleapis.com"
        "secretmanager.googleapis.com"
        "compute.googleapis.com"
        "dns.googleapis.com"
        "certificatemanager.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        gcloud services enable ${api}
    done
    
    print_status "GCP APIs enabled"
}

# Create GKE cluster
create_gke_cluster() {
    echo -e "${BLUE}☸️  Creating GKE cluster...${NC}"
    
    # Check if cluster exists
    if gcloud container clusters describe ${PROJECT_NAME}-cluster --region=${REGION} &> /dev/null; then
        print_warning "Cluster already exists, skipping creation"
    else
        gcloud container clusters create ${PROJECT_NAME}-cluster \
            --region=${REGION} \
            --num-nodes=3 \
            --machine-type=e2-standard-2 \
            --disk-size=50GB \
            --disk-type=pd-ssd \
            --enable-autoscaling \
            --min-nodes=1 \
            --max-nodes=10 \
            --enable-autorepair \
            --enable-autoupgrade \
            --enable-ip-alias \
            --network=default \
            --subnetwork=default \
            --enable-network-policy \
            --enable-stackdriver-kubernetes \
            --enable-cloud-logging \
            --enable-cloud-monitoring
        
        print_status "GKE cluster created"
    fi
    
    # Get cluster credentials
    gcloud container clusters get-credentials ${PROJECT_NAME}-cluster --region=${REGION}
    print_status "Cluster credentials configured"
}

# Create Cloud SQL instance
create_cloud_sql() {
    echo -e "${BLUE}🗄️  Creating Cloud SQL instance...${NC}"
    
    # Check if instance exists
    if gcloud sql instances describe ${PROJECT_NAME}-db --region=${REGION} &> /dev/null; then
        print_warning "Cloud SQL instance already exists, skipping creation"
    else
        gcloud sql instances create ${PROJECT_NAME}-db \
            --region=${REGION} \
            --database-version=POSTGRES_15 \
            --tier=db-f1-micro \
            --storage-type=SSD \
            --storage-size=20GB \
            --storage-auto-increase \
            --backup \
            --enable-ip-alias \
            --authorized-networks=0.0.0.0/0
        
        # Create database
        gcloud sql databases create flavours --instance=${PROJECT_NAME}-db
        
        # Create user
        gcloud sql users create flavours_user --instance=${PROJECT_NAME}-db --password=your_secure_password_here
        
        print_status "Cloud SQL instance created"
    fi
}

# Create Cloud Storage bucket
create_storage_bucket() {
    echo -e "${BLUE}💾 Creating Cloud Storage bucket...${NC}"
    
    local bucket_name="${PROJECT_NAME}-production-media"
    
    # Check if bucket exists
    if gsutil ls -b gs://${bucket_name} &> /dev/null; then
        print_warning "Storage bucket already exists, skipping creation"
    else
        gsutil mb -p ${PROJECT_ID} -c STANDARD -l ${REGION} gs://${bucket_name}
        
        # Set bucket permissions
        gsutil iam ch allUsers:objectViewer gs://${bucket_name}
        
        print_status "Cloud Storage bucket created"
    fi
}

# Setup Firebase project
setup_firebase() {
    echo -e "${BLUE}🔥 Setting up Firebase project...${NC}"
    
    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        npm install -g firebase-tools
    fi
    
    # Login to Firebase
    firebase login --no-localhost
    
    # Check if project exists
    if firebase use ${PROJECT_ID} &> /dev/null; then
        print_warning "Firebase project ${PROJECT_ID} already exists and is in use"
    else
        print_warning "Firebase project ${PROJECT_ID} not found. Please create it in Firebase Console first."
        echo "Visit: https://console.firebase.google.com/"
        echo "Create a new project with ID: ${PROJECT_ID}"
        echo "Then run this script again."
        return 1
    fi
    
    # Deploy Firebase configuration
    firebase deploy --project ${PROJECT_ID}
    
    print_status "Firebase project configured"
}

# Create service accounts
create_service_accounts() {
    echo -e "${BLUE}👤 Creating service accounts...${NC}"
    
    local service_accounts=(
        "flavours-backend"
        "flavours-cloud-sql-proxy"
        "flavours-gcs-fuse"
    )
    
    for sa in "${service_accounts[@]}"; do
        # Check if service account exists
        if gcloud iam service-accounts describe ${sa}@${PROJECT_ID}.iam.gserviceaccount.com &> /dev/null; then
            print_warning "Service account ${sa} already exists, skipping creation"
        else
            gcloud iam service-accounts create ${sa} \
                --display-name="Flavours ${sa}" \
                --description="Service account for Flavours ${sa}"
            
            print_status "Service account ${sa} created"
        fi
    done
    
    # Grant necessary permissions
    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:flavours-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/storage.admin"
    
    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:flavours-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor"
    
    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:flavours-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/monitoring.metricWriter"
    
    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:flavours-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/logging.logWriter"
    
    print_status "Service account permissions configured"
}

# Build and push Docker images
build_and_push_images() {
    echo -e "${BLUE}🐳 Building and pushing Docker images...${NC}"
    
    # Configure Docker for GCR
    gcloud auth configure-docker gcr.io
    
    # Build backend image
    echo "Building backend image..."
    docker build -t gcr.io/${PROJECT_ID}/backend:latest -f backend/Dockerfile backend/
    docker push gcr.io/${PROJECT_ID}/backend:latest
    
    # Build frontend image
    echo "Building frontend image..."
    docker build -t gcr.io/${PROJECT_ID}/frontend:latest -f Dockerfile .
    docker push gcr.io/${PROJECT_ID}/frontend:latest
    
    # Tag images for environment
    docker tag gcr.io/${PROJECT_ID}/backend:latest gcr.io/${PROJECT_ID}/backend:${ENVIRONMENT}
    docker tag gcr.io/${PROJECT_ID}/frontend:latest gcr.io/${PROJECT_ID}/frontend:${ENVIRONMENT}
    
    docker push gcr.io/${PROJECT_ID}/backend:${ENVIRONMENT}
    docker push gcr.io/${PROJECT_ID}/frontend:${ENVIRONMENT}
    
    print_status "Docker images built and pushed to GCR"
}

# Deploy to GKE
deploy_to_gke() {
    echo -e "${BLUE}☸️  Deploying to GKE...${NC}"
    
    # Create namespace
    kubectl create namespace ${PROJECT_NAME} --dry-run=client -o yaml | kubectl apply -f -
    print_status "Namespace created/updated"
    
    # Apply ConfigMaps
    kubectl apply -f k8s/configmap.yaml -n ${PROJECT_NAME}
    print_status "ConfigMaps applied"
    
    # Apply Secrets (you'll need to create these manually)
    print_warning "Please ensure secrets are created in Kubernetes:"
    echo "kubectl create secret generic app-secrets -n ${PROJECT_NAME} \\"
    echo "  --from-literal=database-url=\$DATABASE_URL \\"
    echo "  --from-literal=redis-url=\$REDIS_URL \\"
    echo "  --from-literal=jwt-secret=\$JWT_SECRET \\"
    echo "  --from-literal=supabase-service-role-key=\$SUPABASE_SERVICE_ROLE_KEY \\"
    echo "  --from-literal=stripe-secret-key=\$STRIPE_SECRET_KEY"
    
    # Apply GCP-specific deployments
    kubectl apply -f k8s/gcp-backend.yaml -n ${PROJECT_NAME}
    kubectl apply -f k8s/gcp-cloud-sql.yaml -n ${PROJECT_NAME}
    kubectl apply -f k8s/gcp-storage.yaml -n ${PROJECT_NAME}
    kubectl apply -f k8s/frontend.yaml -n ${PROJECT_NAME}
    
    print_status "GKE deployments applied"
    
    # Wait for deployments to be ready
    echo "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/backend -n ${PROJECT_NAME}
    kubectl wait --for=condition=available --timeout=300s deployment/frontend -n ${PROJECT_NAME}
    print_status "Deployments are ready"
}

# Setup monitoring
setup_monitoring() {
    echo -e "${BLUE}📊 Setting up Cloud Monitoring...${NC}"
    
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
    
    # Reserve static IP
    gcloud compute addresses create flavours-backend-ip --global
    
    # Create managed SSL certificate
    gcloud compute ssl-certificates create flavours-backend-ssl-cert \
        --domains=api.${DOMAIN} \
        --global
    
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
    BACKEND_URL=$(kubectl get service backend-service -n ${PROJECT_NAME} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    FRONTEND_URL=$(kubectl get service frontend-service -n ${PROJECT_NAME} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
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
    echo -e "${BLUE}🚀 Starting Flavours GCP Production Deployment${NC}"
    echo "=================================================="
    
    check_dependencies
    authenticate_gcp
    enable_apis
    create_gke_cluster
    create_cloud_sql
    create_storage_bucket
    setup_firebase
    create_service_accounts
    build_and_push_images
    deploy_to_gke
    setup_monitoring
    setup_ssl
    run_migrations
    health_check
    
    echo ""
    echo -e "${GREEN}🎉 GCP Deployment completed successfully!${NC}"
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
    echo -e "${BLUE}🔧 GCP Console:${NC}"
    echo "GKE Cluster: https://console.cloud.google.com/kubernetes/cluster/details/${REGION}/${PROJECT_NAME}-cluster"
    echo "Cloud SQL: https://console.cloud.google.com/sql/instances/${PROJECT_NAME}-db"
    echo "Cloud Storage: https://console.cloud.google.com/storage/browser/${PROJECT_NAME}-production-media"
    echo "Monitoring: https://console.cloud.google.com/monitoring"
    echo ""
}

# Run main function
main "$@"
