#!/bin/bash

# Firebase Setup Script for Organization Account
# This script sets up Firebase with organization access

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${1:-"flavours-production"}
PROJECT_NAME="Flavours Production"

echo -e "${BLUE}🔥 Setting up Firebase for Organization Account${NC}"
echo -e "${BLUE}Project ID: ${PROJECT_ID}${NC}"
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

# Check if Firebase CLI is installed
check_firebase_cli() {
    echo -e "${BLUE}🔍 Checking Firebase CLI...${NC}"
    
    if ! command -v firebase &> /dev/null; then
        print_warning "Firebase CLI not found. Installing..."
        npm install -g firebase-tools
        print_status "Firebase CLI installed"
    else
        print_status "Firebase CLI is already installed"
    fi
}

# Authenticate with Firebase
authenticate_firebase() {
    echo -e "${BLUE}🔐 Authenticating with Firebase...${NC}"
    
    # Login to Firebase
    firebase login --no-localhost
    
    print_status "Firebase authentication completed"
}

# List available projects
list_projects() {
    echo -e "${BLUE}📋 Available Firebase Projects:${NC}"
    firebase projects:list
    echo ""
}

# Initialize Firebase project
init_firebase_project() {
    echo -e "${BLUE}🚀 Initializing Firebase project...${NC}"
    
    # Check if project exists
    if firebase use ${PROJECT_ID} &> /dev/null; then
        print_warning "Project ${PROJECT_ID} already exists and is in use"
    else
        print_warning "Project ${PROJECT_ID} not found. Please create it in Firebase Console first."
        echo "Visit: https://console.firebase.google.com/"
        echo "Create a new project with ID: ${PROJECT_ID}"
        echo "Then run this script again."
        exit 1
    fi
    
    # Initialize Firebase in the project
    firebase init --project ${PROJECT_ID}
    
    print_status "Firebase project initialized"
}

# Configure Firebase services
configure_firebase_services() {
    echo -e "${BLUE}⚙️  Configuring Firebase services...${NC}"
    
    # Enable Firestore
    firebase firestore:rules:deploy --project ${PROJECT_ID}
    firebase firestore:indexes:deploy --project ${PROJECT_ID}
    
    # Enable Storage
    firebase storage:rules:deploy --project ${PROJECT_ID}
    
    # Enable Hosting
    firebase hosting:channel:deploy production --project ${PROJECT_ID}
    
    print_status "Firebase services configured"
}

# Set up Firebase Admin SDK
setup_firebase_admin() {
    echo -e "${BLUE}🔧 Setting up Firebase Admin SDK...${NC}"
    
    # Create Firebase Admin SDK configuration
    cat > backend/src/config/firebase-admin.json << EOF
{
  "type": "service_account",
  "project_id": "${PROJECT_ID}",
  "private_key_id": "auto-generated",
  "private_key": "auto-generated",
  "client_email": "auto-generated",
  "client_id": "auto-generated",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40${PROJECT_ID}.iam.gserviceaccount.com"
}
EOF
    
    print_status "Firebase Admin SDK configuration created"
}

# Deploy Firebase configuration
deploy_firebase_config() {
    echo -e "${BLUE}🚀 Deploying Firebase configuration...${NC}"
    
    # Deploy Firestore rules
    firebase deploy --only firestore:rules --project ${PROJECT_ID}
    
    # Deploy Storage rules
    firebase deploy --only storage --project ${PROJECT_ID}
    
    # Deploy Hosting
    firebase deploy --only hosting --project ${PROJECT_ID}
    
    print_status "Firebase configuration deployed"
}

# Get Firebase configuration
get_firebase_config() {
    echo -e "${BLUE}📋 Firebase Configuration:${NC}"
    
    # Get project info
    firebase projects:list --project ${PROJECT_ID}
    
    # Get web app config
    echo ""
    echo -e "${BLUE}Web App Configuration:${NC}"
    firebase apps:sdkconfig web --project ${PROJECT_ID}
    
    print_status "Firebase configuration retrieved"
}

# Main setup function
main() {
    echo -e "${BLUE}🔥 Starting Firebase Setup for Organization Account${NC}"
    echo "=================================================="
    
    check_firebase_cli
    authenticate_firebase
    list_projects
    init_firebase_project
    configure_firebase_services
    setup_firebase_admin
    deploy_firebase_config
    get_firebase_config
    
    echo ""
    echo -e "${GREEN}🎉 Firebase setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "1. Copy the web app configuration above"
    echo "2. Update your environment variables"
    echo "3. Deploy your application"
    echo ""
    echo -e "${BLUE}🔗 Firebase Console:${NC}"
    echo "https://console.firebase.google.com/project/${PROJECT_ID}"
    echo ""
}

# Run main function
main "$@"
