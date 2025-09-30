#!/bin/bash

# Script to fix remaining toLocaleDateString hydration issues
# This script will update all remaining files that use toLocaleDateString

echo "🔧 Fixing remaining hydration issues..."

# Function to update a file
update_file() {
    local file="$1"
    local import_line="$2"
    local replacement="$3"
    
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Add import if not already present
        if ! grep -q "from '@/lib/date-utils'" "$file"; then
            # Find the last import line and add our import after it
            sed -i '' "/^import.*from.*$/a\\
$import_line
" "$file"
        fi
        
        # Replace the toLocaleDateString usage
        sed -i '' "s/$replacement/g" "$file"
    fi
}

# Update remaining files
update_file "app/resources/legal/terms/page.tsx" "import { getCurrentDate } from '@/lib/date-utils'" "new Date().toLocaleDateString()/getCurrentDate()/g"
update_file "app/resources/support/cookie-notice/page.tsx" "import { getCurrentDate } from '@/lib/date-utils'" "new Date().toLocaleDateString()/getCurrentDate()/g"
update_file "app/profile/[username]/followers/page.tsx" "import { formatDate } from '@/lib/date-utils'" "new Date(follower.followed_date).toLocaleDateString()/formatDate(follower.followed_date)/g"
update_file "app/profile/[username]/following/page.tsx" "import { formatDate } from '@/lib/date-utils'" "new Date(user.followed_date).toLocaleDateString()/formatDate(user.followed_date)/g"
update_file "app/users/page.tsx" "import { formatDate } from '@/lib/date-utils'" "new Date(dateString).toLocaleDateString('en-US', {/formatDate(dateString, {/g"
update_file "app/statements/page.tsx" "import { formatDate } from '@/lib/date-utils'" "new Date(statement.date).toLocaleDateString()/formatDate(statement.date)/g"
update_file "app/settings/page.tsx" "import { formatDate } from '@/lib/date-utils'" "new Date(dateString).toLocaleDateString('en-US', {/formatDate(dateString, {/g"
update_file "app/collections/page.tsx" "import { formatDate } from '@/lib/date-utils'" "collection.lastUpdated.toLocaleDateString()/formatDate(collection.lastUpdated)/g"

echo "✅ Hydration fixes completed!"
echo "📝 Note: You may need to manually review some files for complex date formatting patterns."
