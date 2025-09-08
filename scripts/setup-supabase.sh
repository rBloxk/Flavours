#!/bin/bash

# Supabase Setup Script
# This script sets up Supabase for the Flavours project

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="flavours"
PROJECT_ID=${1:-"flavours-production"}
REGION=${2:-"us-central1"}

echo -e "${BLUE}🗄️  Setting up Supabase for Flavours${NC}"
echo -e "${BLUE}Project ID: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
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

# Check if Supabase CLI is installed
check_supabase_cli() {
    echo -e "${BLUE}🔍 Checking Supabase CLI...${NC}"
    
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI not found. Installing..."
        
        # Install Supabase CLI
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install supabase/tap/supabase
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            curl -fsSL https://supabase.com/install.sh | sh
        else
            print_error "Unsupported OS. Please install Supabase CLI manually."
            echo "Visit: https://supabase.com/docs/guides/cli/getting-started"
            exit 1
        fi
        
        print_status "Supabase CLI installed"
    else
        print_status "Supabase CLI is already installed"
    fi
}

# Login to Supabase
authenticate_supabase() {
    echo -e "${BLUE}🔐 Authenticating with Supabase...${NC}"
    
    # Login to Supabase
    supabase login
    
    print_status "Supabase authentication completed"
}

# List available projects
list_projects() {
    echo -e "${BLUE}📋 Available Supabase Projects:${NC}"
    supabase projects list
    echo ""
}

# Initialize Supabase project
init_supabase_project() {
    echo -e "${BLUE}🚀 Initializing Supabase project...${NC}"
    
    # Check if project exists
    if supabase projects list | grep -q "${PROJECT_ID}"; then
        print_warning "Project ${PROJECT_ID} already exists"
    else
        print_warning "Project ${PROJECT_ID} not found. Please create it in Supabase Console first."
        echo "Visit: https://supabase.com/dashboard"
        echo "Create a new project with ID: ${PROJECT_ID}"
        echo "Then run this script again."
        exit 1
    fi
    
    # Link to existing project
    supabase link --project-ref ${PROJECT_ID}
    
    print_status "Supabase project linked"
}

# Run database migrations
run_migrations() {
    echo -e "${BLUE}🗄️  Running database migrations...${NC}"
    
    # Check if migrations exist
    if [ -d "supabase/migrations" ]; then
        # Push migrations to Supabase
        supabase db push
        
        print_status "Database migrations applied"
    else
        print_warning "No migrations found. Creating initial migration..."
        
        # Create initial migration
        supabase migration new initial_setup
        
        print_status "Initial migration created"
    fi
}

# Generate TypeScript types
generate_types() {
    echo -e "${BLUE}🔧 Generating TypeScript types...${NC}"
    
    # Check if types file exists
    if [ -f "lib/supabase-types.ts" ]; then
        print_warning "Types file already exists. Backing up..."
        cp lib/supabase-types.ts lib/supabase-types.ts.backup
    fi
    
    # Generate types from Supabase
    supabase gen types typescript --project-id ${PROJECT_ID} > lib/supabase-types.ts
    
    # Check if generation was successful
    if [ -s "lib/supabase-types.ts" ]; then
        print_status "TypeScript types generated successfully"
    else
        print_warning "Type generation failed. Using existing types file."
        if [ -f "lib/supabase-types.ts.backup" ]; then
            mv lib/supabase-types.ts.backup lib/supabase-types.ts
        fi
    fi
}

# Setup Row Level Security (RLS)
setup_rls() {
    echo -e "${BLUE}🔒 Setting up Row Level Security...${NC}"
    
    # Enable RLS on all tables
    cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_enable_rls.sql << 'EOF'
-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Profiles are public
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Posts are viewable by everyone
CREATE POLICY "Posts are viewable by everyone" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Creators can create posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own posts" ON posts
    FOR UPDATE USING (auth.uid() = creator_id);

-- Subscriptions are private
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions are private
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = creator_id);

-- Messages are private to participants
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

-- Messages are private to conversation participants
CREATE POLICY "Users can view messages in own conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_id 
            AND auth.uid() = ANY(participants)
        )
    );

CREATE POLICY "Users can send messages in own conversations" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_id 
            AND auth.uid() = ANY(participants)
        )
    );

-- Notifications are private
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Collections are private
CREATE POLICY "Users can view own collections" ON collections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create collections" ON collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON collections
    FOR UPDATE USING (auth.uid() = user_id);

-- Vault is private
CREATE POLICY "Users can view own vault" ON vault
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create vault items" ON vault
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault items" ON vault
    FOR UPDATE USING (auth.uid() = user_id);

-- Payment methods are private
CREATE POLICY "Users can view own payment methods" ON payment_methods
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create payment methods" ON payment_methods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods" ON payment_methods
    FOR UPDATE USING (auth.uid() = user_id);
EOF

    # Apply RLS migration
    supabase db push
    
    print_status "Row Level Security configured"
}

# Get project configuration
get_project_config() {
    echo -e "${BLUE}📋 Supabase Project Configuration:${NC}"
    
    # Get project info
    supabase projects list --project-id ${PROJECT_ID}
    
    # Get project URL and keys
    echo ""
    echo -e "${BLUE}Project URL:${NC}"
    echo "https://${PROJECT_ID}.supabase.co"
    
    echo ""
    echo -e "${BLUE}API Keys:${NC}"
    echo "Anon Key: (Get from Supabase Dashboard)"
    echo "Service Role Key: (Get from Supabase Dashboard)"
    
    print_status "Project configuration retrieved"
}

# Setup database functions
setup_functions() {
    echo -e "${BLUE}🔧 Setting up database functions...${NC}"
    
    # Create utility functions
    cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_functions.sql << 'EOF'
-- Utility functions for Flavours

-- Function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    is_creator BOOLEAN,
    is_verified BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.display_name,
        p.avatar_url,
        p.bio,
        p.is_creator,
        p.is_verified,
        p.created_at
    FROM profiles p
    WHERE p.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get creator stats
CREATE OR REPLACE FUNCTION get_creator_stats(creator_uuid UUID)
RETURNS TABLE (
    total_posts BIGINT,
    total_subscribers BIGINT,
    total_earnings DECIMAL,
    total_likes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM posts WHERE creator_id = creator_uuid) as total_posts,
        (SELECT COUNT(*) FROM subscriptions WHERE creator_id = creator_uuid) as total_subscribers,
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE creator_id = creator_uuid) as total_earnings,
        (SELECT COALESCE(SUM(likes_count), 0) FROM posts WHERE creator_id = creator_uuid) as total_likes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search posts
CREATE OR REPLACE FUNCTION search_posts(search_query TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    creator_id UUID,
    creator_username TEXT,
    creator_display_name TEXT,
    creator_avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    likes_count INTEGER,
    comments_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.content,
        p.creator_id,
        pr.username,
        pr.display_name,
        pr.avatar_url,
        p.created_at,
        p.likes_count,
        p.comments_count
    FROM posts p
    JOIN profiles pr ON p.creator_id = pr.user_id
    WHERE 
        p.title ILIKE '%' || search_query || '%' OR
        p.content ILIKE '%' || search_query || '%'
    ORDER BY p.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get feed posts
CREATE OR REPLACE FUNCTION get_feed_posts(user_uuid UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    creator_id UUID,
    creator_username TEXT,
    creator_display_name TEXT,
    creator_avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    likes_count INTEGER,
    comments_count INTEGER,
    is_liked BOOLEAN,
    is_bookmarked BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.content,
        p.creator_id,
        pr.username,
        pr.display_name,
        pr.avatar_url,
        p.created_at,
        p.likes_count,
        p.comments_count,
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = user_uuid) as is_liked,
        EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = user_uuid) as is_bookmarked
    FROM posts p
    JOIN profiles pr ON p.creator_id = pr.user_id
    WHERE 
        p.is_public = true OR
        EXISTS(SELECT 1 FROM subscriptions WHERE creator_id = p.creator_id AND user_id = user_uuid)
    ORDER BY p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
EOF

    # Apply functions migration
    supabase db push
    
    print_status "Database functions created"
}

# Main setup function
main() {
    echo -e "${BLUE}🗄️  Starting Supabase Setup${NC}"
    echo "=================================================="
    
    check_supabase_cli
    authenticate_supabase
    list_projects
    init_supabase_project
    run_migrations
    setup_rls
    setup_functions
    generate_types
    get_project_config
    
    echo ""
    echo -e "${GREEN}🎉 Supabase setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "1. Get your API keys from Supabase Dashboard"
    echo "2. Update your environment variables"
    echo "3. Deploy your application"
    echo ""
    echo -e "${BLUE}🔗 Supabase Dashboard:${NC}"
    echo "https://supabase.com/dashboard/project/${PROJECT_ID}"
    echo ""
    echo -e "${BLUE}📋 API Keys Location:${NC}"
    echo "Settings > API > Project API keys"
    echo ""
}

# Run main function
main "$@"
