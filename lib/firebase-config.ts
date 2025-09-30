// Firebase Configuration for Frontend
// This file contains the Firebase configuration for the frontend application

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your_firebase_api_key_here",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "flavours-production.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "flavours-production",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "flavours-production.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your_messaging_sender_id_here",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your_firebase_app_id_here",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://flavours-production-default-rtdb.firebaseio.com"
}

// Firebase configuration for different environments
export const getFirebaseConfig = (environment: string = 'production') => {
  const configs = {
    development: {
      apiKey: "dev_firebase_api_key",
      authDomain: "flavours-club.firebaseapp.com",
      projectId: "flavours-club",
      storageBucket: "flavours-club.appspot.com",
      messagingSenderId: "dev_messaging_sender_id",
      appId: "dev_firebase_app_id",
      databaseURL: "https://flavours-club-default-rtdb.firebaseio.com"
    },
    staging: {
      apiKey: "staging_firebase_api_key",
      authDomain: "flavours-staging.firebaseapp.com",
      projectId: "flavours-staging",
      storageBucket: "flavours-staging.appspot.com",
      messagingSenderId: "staging_messaging_sender_id",
      appId: "staging_firebase_app_id",
      databaseURL: "https://flavours-staging-default-rtdb.firebaseio.com"
    },
    production: firebaseConfig
  }

  return configs[environment as keyof typeof configs] || firebaseConfig
}

// Firebase service configuration
export const firebaseServices = {
  auth: {
    enabled: true,
    providers: ['email', 'google', 'facebook', 'twitter'],
    requireEmailVerification: true,
    passwordMinLength: 8
  },
  firestore: {
    enabled: true,
    cacheSize: 40,
    offlinePersistence: true
  },
  storage: {
    enabled: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm']
  },
  functions: {
    enabled: true,
    region: 'us-central1'
  },
  analytics: {
    enabled: true,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  },
  performance: {
    enabled: true
  },
  crashlytics: {
    enabled: true
  }
}

// Firebase security rules configuration
export const firebaseSecurityRules = {
  firestore: {
    version: '2',
    rules: {
      users: {
        read: 'auth != null && auth.uid == resource.id',
        write: 'auth != null && auth.uid == resource.id'
      },
      posts: {
        read: 'auth != null',
        write: 'auth != null && auth.uid == resource.data.creatorId'
      },
      messages: {
        read: 'auth != null && auth.uid in resource.data.participants',
        write: 'auth != null && auth.uid in resource.data.participants'
      }
    }
  },
  storage: {
    rules: {
      avatars: {
        read: 'auth != null',
        write: 'auth != null && auth.uid == resource.id'
      },
      content: {
        read: 'auth != null',
        write: 'auth != null && auth.uid == resource.id'
      }
    }
  }
}

// Firebase error codes and messages
export const firebaseErrorCodes = {
  'auth/user-not-found': 'No user found with this email address.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/email-already-in-use': 'This email address is already in use.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/requires-recent-login': 'Please log in again to complete this action.',
  'storage/unauthorized': 'You do not have permission to access this file.',
  'storage/canceled': 'Upload was canceled.',
  'storage/unknown': 'An unknown error occurred.',
  'firestore/permission-denied': 'You do not have permission to access this data.',
  'firestore/unavailable': 'Service is currently unavailable.'
}

// Firebase configuration validation
export const validateFirebaseConfig = (config: any) => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
  
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required Firebase configuration field: ${field}`)
    }
  }
  
  return true
}

// Initialize Firebase configuration
export const initializeFirebaseConfig = () => {
  const config = getFirebaseConfig(process.env.NODE_ENV)
  validateFirebaseConfig(config)
  return config
}
