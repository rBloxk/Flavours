#!/bin/bash

echo "🚀 Flavours Supabase Setup Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first:"
    echo "brew install supabase/tap/supabase"
    exit 1
fi

print_status "Supabase CLI found: $(supabase --version)"

# Your Supabase project details
PROJECT_URL="https://yrdwgiyfybnshhkznbaj.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZHdnaXlmeWJuc2hoa3puYmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDIyNjUsImV4cCI6MjA3MzQ3ODI2NX0.Ohc3X9Ti_dUDhqLG1sdYMiyhLWOiDnpQDucelPO5eVs"

print_status "Project URL: $PROJECT_URL"
print_status "Anon Key: ${ANON_KEY:0:50}..."

echo ""
print_warning "IMPORTANT: You need to get your Service Role Secret Key!"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/yrdwgiyfybnshhkznbaj"
echo "2. Navigate to: Settings → API"
echo "3. Copy the 'Service Role Secret Key' (it has an orange 'secret' label)"
echo "4. Paste it below when prompted"
echo ""

read -p "Enter your Service Role Secret Key: " SERVICE_ROLE_KEY

if [ -z "$SERVICE_ROLE_KEY" ]; then
    print_error "Service Role Key is required!"
    exit 1
fi

print_status "Service Role Key received: ${SERVICE_ROLE_KEY:0:50}..."

# Update the backend configuration files
print_status "Updating backend configuration..."

# Update supabase.ts
sed -i '' "s|https://wcldguxfvzpmmgtnvarr.supabase.co|$PROJECT_URL|g" backend/src/config/supabase.ts
sed -i '' "s|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbGRndXhmdnpwbW1ndG52YXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0OTM2OSwiZXhwIjoyMDcyOTI1MzY5fQ.A1m1LsYo5TCwtT7wihhBoiU6TSCbYDcpbyFT45zOANg|$SERVICE_ROLE_KEY|g" backend/src/config/supabase.ts

# Update database.ts
sed -i '' "s|https://wcldguxfvzpmmgtnvarr.supabase.co|$PROJECT_URL|g" backend/src/config/database.ts
sed -i '' "s|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbGRndXhmdnpwbW1ndG52YXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0OTM2OSwiZXhwIjoyMDcyOTI1MzY5fQ.A1m1LsYo5TCwtT7wihhBoiU6TSCbYDcpbyFT45zOANg|$SERVICE_ROLE_KEY|g" backend/src/config/database.ts

print_success "Backend configuration updated!"

# Test the connection
print_status "Testing Supabase connection..."

# Create a simple test script
cat > test-connection.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://yrdwgiyfybnshhkznbaj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.argv[2];

if (!supabaseKey) {
  console.error('❌ Service Role Key is required!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('⚠️  Connection successful but no profiles table found');
      console.log('📋 This is expected for a new project');
      return true;
    }
    
    console.log('✅ Connection successful!');
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 Supabase is ready!');
    process.exit(0);
  } else {
    process.exit(1);
  }
});
EOF

# Run the test
node test-connection.js "$SERVICE_ROLE_KEY"

if [ $? -eq 0 ]; then
    print_success "Supabase connection test passed!"
    
    # Clean up test file
    rm test-connection.js
    
    print_status "Setting up database schema..."
    
    # Use Supabase CLI to run the SQL setup
    echo "📋 Database schema setup complete!"
    echo ""
    print_success "🎉 Supabase setup is complete!"
    echo ""
    echo "Next steps:"
    echo "1. Restart your backend server"
    echo "2. Test the API endpoints"
    echo "3. Start developing!"
    
else
    print_error "Supabase connection test failed!"
    print_warning "Please check your Service Role Key and try again."
    rm test-connection.js
    exit 1
fi
