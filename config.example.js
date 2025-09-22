// Example configuration file for Flavours Platform
// Copy this to config.js and update with your actual values

module.exports = {
  // Frontend Configuration
  frontend: {
    port: 3000,
    apiUrl: 'http://localhost:3001/api/v1',
    wsUrl: 'http://localhost:3001'
  },

  // Backend Configuration
  backend: {
    port: 3001,
    nodeEnv: 'development'
  },

  // Admin Dashboard Configuration
  admin: {
    port: 3002,
    apiUrl: 'http://localhost:3001/api/v1'
  },

  // Supabase Configuration
  supabase: {
    url: 'https://wcldguxfvzpmmgtnvarr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbGRndXhmdnpwbW1ndG52YXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDkzNjksImV4cCI6MjA3MjkyNTM2OX0.QZI1AW_frmF0RZziHo1pdKvkRzvLxR8VeO5OW8K6jYQ',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbGRndXhmdnpwbW1ndG52YXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0OTM2OSwiZXhwIjoyMDcyOTI1MzY5fQ.A1m1LsYo5TCwtT7wihhBoiU6TSCbYDcpbyFT45zOANg'
  },

  // Firebase Configuration (Development)
  firebase: {
    apiKey: 'your_firebase_api_key_here',
    authDomain: 'flavours-dev.firebaseapp.com',
    projectId: 'flavours-dev',
    storageBucket: 'flavours-dev.appspot.com',
    messagingSenderId: 'your_messaging_sender_id_here',
    appId: 'your_firebase_app_id_here',
    databaseURL: 'https://flavours-dev-default-rtdb.firebaseio.com'
  },

  // Database Configuration
  database: {
    url: 'postgresql://postgres:password@localhost:5432/flavours',
    redis: 'redis://localhost:6379'
  },

  // Security Configuration
  security: {
    jwtSecret: 'your_jwt_secret_here_development',
    sessionSecret: 'your_session_secret_here_development',
    corsOrigin: 'http://localhost:3000'
  },

  // Feature Flags
  features: {
    userRegistration: true,
    creatorRegistration: true,
    paymentProcessing: true,
    contentUpload: true,
    messaging: true,
    notifications: true,
    analytics: true,
    moderation: true
  },

  // Development Configuration
  development: {
    debug: true,
    verboseLogging: true,
    enableSwagger: true,
    enableGraphQLPlayground: false
  }
}
