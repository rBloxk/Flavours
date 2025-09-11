#!/bin/bash

echo "🚀 Starting Flavours Admin Dashboard"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the admin-dashboard directory"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set environment variables
export NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"

echo "🌐 Starting admin dashboard on port 3002..."
echo "📊 Backend API: http://localhost:3001"
echo "🔗 Admin Dashboard: http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop"

# Start the development server
npm run dev
