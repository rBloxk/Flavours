#!/bin/bash

# Database setup script for Flavours platform
# This script sets up the Supabase database with the initial schema and seed data

set -e

echo "🚀 Setting up Flavours database..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/schema.sql" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Set environment variables
export SUPABASE_URL=${SUPABASE_URL:-"https://yrdwgiyfybnshhkznbaj.supabase.co"}
export SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZHdnaXlmeWJuc2hoa3puYmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDIyNjUsImV4cCI6MjA3MzQ3ODI2NX0.Ohc3X9Ti_dUDhqLG1sdYMiyhLWOiDnpQDucelPO5eVs"}
export SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZHdnaXlmeWJuc2hoa3puYmFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwMjI2NSwiZXhwIjoyMDczNDc4MjY1fQ.fc8QJ_t-7rXP71P3acLs8JpeHYOt7z3JarZKX477fqI"}

echo "📋 Database Configuration:"
echo "   URL: $SUPABASE_URL"
echo "   Anon Key: ${SUPABASE_ANON_KEY:0:20}..."
echo "   Service Key: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    echo "🔄 $description..."
    
    if [ -f "$file" ]; then
        # Use psql to execute the SQL file
        PGPASSWORD=$SUPABASE_SERVICE_ROLE_KEY psql \
            -h db.yrdwgiyfybnshhkznbaj.supabase.co \
            -p 5432 \
            -d postgres \
            -U postgres \
            -f "$file" \
            --quiet
        
        if [ $? -eq 0 ]; then
            echo "✅ $description completed successfully"
        else
            echo "❌ $description failed"
            exit 1
        fi
    else
        echo "⚠️  File $file not found, skipping..."
    fi
}

# Function to check database connection
check_connection() {
    echo "🔍 Checking database connection..."
    
    PGPASSWORD=$SUPABASE_SERVICE_ROLE_KEY psql \
        -h db.yrdwgiyfybnshhkznbaj.supabase.co \
        -p 5432 \
        -d postgres \
        -U postgres \
        -c "SELECT version();" \
        --quiet > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Database connection successful"
    else
        echo "❌ Database connection failed"
        echo "   Please check your Supabase credentials and network connection"
        exit 1
    fi
}

# Main setup process
main() {
    echo "🎯 Starting database setup..."
    
    # Check connection first
    check_connection
    
    # Run initial schema migration
    run_sql_file "supabase/migrations/001_initial_schema.sql" "Creating initial database schema"
    
    # Run seed data (optional, for development)
    if [ "$1" = "--seed" ]; then
        run_sql_file "supabase/seed.sql" "Inserting seed data"
    fi
    
    echo ""
    echo "🎉 Database setup completed successfully!"
    echo ""
    echo "📊 Next steps:"
    echo "   1. Update your environment variables with the correct Supabase credentials"
    echo "   2. Test the connection by running: npm run dev"
    echo "   3. Check the admin dashboard at: http://localhost:3002"
    echo ""
    echo "🔧 Useful commands:"
    echo "   - View database: supabase db diff"
    echo "   - Reset database: supabase db reset"
    echo "   - Generate types: supabase gen types typescript --local > lib/supabase-types.ts"
    echo ""
}

# Parse command line arguments
case "${1:-}" in
    --seed)
        main --seed
        ;;
    --help|-h)
        echo "Usage: $0 [--seed] [--help]"
        echo ""
        echo "Options:"
        echo "  --seed    Include seed data for development"
        echo "  --help    Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  SUPABASE_URL              Supabase project URL"
        echo "  SUPABASE_ANON_KEY         Supabase anonymous key"
        echo "  SUPABASE_SERVICE_ROLE_KEY Supabase service role key"
        echo ""
        exit 0
        ;;
    *)
        main
        ;;
esac
