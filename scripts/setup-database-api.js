#!/usr/bin/env node

/**
 * Database setup script using Supabase REST API
 * This script sets up the database schema and seed data via API calls
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://yrdwgiyfybnshhkznbaj.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZHdnaXlmeWJuc2hoa3puYmFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwMjI2NSwiZXhwIjoyMDczNDc4MjY1fQ.fc8QJ_t-7rXP71P3acLs8JpeHYOt7z3JarZKX477fqI';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Function to execute SQL via Supabase API
async function executeSQL(sql) {
  console.log('🔄 Executing SQL...');
  
  const response = await makeRequest(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    body: { sql }
  });

  if (response.status === 200 || response.status === 201) {
    console.log('✅ SQL executed successfully');
    return true;
  } else {
    console.log('❌ SQL execution failed:', response.status, response.data);
    return false;
  }
}

// Function to check if table exists
async function tableExists(tableName) {
  const response = await makeRequest(`${SUPABASE_URL}/rest/v1/${tableName}?select=*&limit=1`);
  return response.status === 200;
}

// Function to insert seed data
async function insertSeedData() {
  console.log('🌱 Inserting seed data...');

  // Insert sample profiles
  const profiles = [
    {
      user_id: '00000000-0000-0000-0000-000000000001',
      username: 'admin',
      display_name: 'Admin User',
      email: 'admin@flavours.club',
      role: 'admin',
      is_verified: true,
      is_creator: false,
      bio: 'Platform administrator',
      location: 'San Francisco, CA'
    },
    {
      user_id: '00000000-0000-0000-0000-000000000002',
      username: 'creator1',
      display_name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'creator',
      is_verified: true,
      is_creator: true,
      bio: 'Content creator and influencer',
      location: 'Los Angeles, CA'
    },
    {
      user_id: '00000000-0000-0000-0000-000000000003',
      username: 'creator2',
      display_name: 'Mike Chen',
      email: 'mike@example.com',
      role: 'creator',
      is_verified: true,
      is_creator: true,
      bio: 'Tech reviewer and educator',
      location: 'New York, NY'
    }
  ];

  for (const profile of profiles) {
    const response = await makeRequest(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      body: profile
    });
    
    if (response.status === 201) {
      console.log(`✅ Inserted profile: ${profile.username}`);
    } else {
      console.log(`⚠️  Profile ${profile.username} may already exist`);
    }
  }

  // Insert sample posts
  const posts = [
    {
      user_id: '00000000-0000-0000-0000-000000000002',
      content: 'Just finished an amazing photoshoot! Here are some behind-the-scenes moments. The lighting was perfect and the team was incredible. Can\'t wait to share the final results with you all! 📸✨',
      is_paid: false,
      price: 0,
      privacy: 'public',
      category: 'lifestyle',
      likes_count: 45,
      comments_count: 12,
      views_count: 234
    },
    {
      user_id: '00000000-0000-0000-0000-000000000003',
      content: 'Review: The new MacBook Pro M3 is absolutely incredible. The performance improvements are noticeable immediately, and the battery life is outstanding. Here\'s my detailed analysis...',
      is_paid: false,
      price: 0,
      privacy: 'public',
      category: 'technology',
      likes_count: 67,
      comments_count: 19,
      views_count: 456
    }
  ];

  for (const post of posts) {
    const response = await makeRequest(`${SUPABASE_URL}/rest/v1/posts`, {
      method: 'POST',
      body: post
    });
    
    if (response.status === 201) {
      console.log(`✅ Inserted post: ${post.content.substring(0, 50)}...`);
    } else {
      console.log(`⚠️  Post may already exist`);
    }
  }
}

// Main setup function
async function setupDatabase() {
  console.log('🚀 Setting up Flavours database via API...');
  console.log(`📋 Database URL: ${SUPABASE_URL}`);

  try {
    // Check if profiles table exists
    const profilesExists = await tableExists('profiles');
    
    if (profilesExists) {
      console.log('✅ Database tables already exist');
      
      // Check if we have data
      const response = await makeRequest(`${SUPABASE_URL}/rest/v1/profiles?select=count`);
      if (response.data && response.data.length > 0) {
        console.log('✅ Database already has data');
        return;
      }
    } else {
      console.log('❌ Database tables do not exist');
      console.log('⚠️  Please set up the database schema manually in Supabase dashboard');
      console.log('   1. Go to https://supabase.com/dashboard');
      console.log('   2. Select your project');
      console.log('   3. Go to SQL Editor');
      console.log('   4. Run the SQL from supabase/schema.sql');
      return;
    }

    // Insert seed data
    await insertSeedData();

    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📊 Next steps:');
    console.log('   1. Test the connection by running: npm run dev');
    console.log('   2. Check the admin dashboard at: http://localhost:3002');
    console.log('   3. Test the main app at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
