import dotenv from 'dotenv'
import { logger } from '../utils/logger'

// Load environment variables
dotenv.config()

export interface EnvironmentConfig {
  // Core Application
  NODE_ENV: string
  PORT: number
  API_BASE_URL: string
  FRONTEND_URL: string

  // Database
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string

  // Firebase
  FIREBASE_PROJECT_ID: string
  FIREBASE_PRIVATE_KEY: string
  FIREBASE_CLIENT_EMAIL: string
  FIREBASE_STORAGE_BUCKET: string
  FIREBASE_DATABASE_URL?: string

  // Redis
  REDIS_URL: string
  REDIS_PASSWORD?: string
  REDIS_DB: number

  // JWT
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  JWT_REFRESH_EXPIRES_IN: string

  // Payment Processing
  STRIPE_SECRET_KEY: string
  STRIPE_PUBLISHABLE_KEY: string
  STRIPE_WEBHOOK_SECRET: string

  // File Upload
  MAX_FILE_SIZE: number
  UPLOAD_PATH: string
  ALLOWED_FILE_TYPES: string[]

  // Security
  BCRYPT_ROUNDS: number
  SESSION_SECRET: string
  CORS_ORIGIN: string

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number
  RATE_LIMIT_MAX_REQUESTS: number

  // Logging
  LOG_LEVEL: string
  LOG_FILE_PATH: string

  // Monitoring
  ENABLE_METRICS: boolean
  METRICS_PORT: number
  ENABLE_HEALTH_CHECKS: boolean

  // External Services
  SENTRY_DSN?: string
  NEW_RELIC_LICENSE_KEY?: string
  DATADOG_API_KEY?: string

  // Email
  SMTP_HOST?: string
  SMTP_PORT?: number
  SMTP_USER?: string
  SMTP_PASS?: string

  // AWS (Optional)
  AWS_ACCESS_KEY_ID?: string
  AWS_SECRET_ACCESS_KEY?: string
  AWS_REGION?: string
  AWS_S3_BUCKET?: string

  // CDN
  CDN_URL?: string
  CDN_KEY?: string

  // Feature Flags
  FEATURE_USER_REGISTRATION: boolean
  FEATURE_CREATOR_REGISTRATION: boolean
  FEATURE_PAYMENT_PROCESSING: boolean
  FEATURE_CONTENT_UPLOAD: boolean
  FEATURE_MESSAGING: boolean
  FEATURE_NOTIFICATIONS: boolean
  FEATURE_ANALYTICS: boolean
  FEATURE_MODERATION: boolean

  // Content Moderation
  CONTENT_MODERATION_ENABLED: boolean
  CONTENT_MODERATION_API_KEY?: string

  // Age Verification
  AGE_VERIFICATION_ENABLED: boolean
  AGE_VERIFICATION_API_KEY?: string

  // DMCA
  DMCA_ENABLED: boolean
  DMCA_EMAIL?: string

  // Legal Compliance
  LEGAL_COMPLIANCE_ENABLED: boolean
  LEGAL_COMPLIANCE_REGION: string
  LEGAL_COMPLIANCE_LAWS: string[]

  // Cache
  CACHE_TTL_DEFAULT: number
  CACHE_TTL_USER: number
  CACHE_TTL_POST: number
  CACHE_TTL_FEED: number

  // Database Pool
  DB_MAX_CONNECTIONS: number
  DB_CONNECTION_TIMEOUT: number
  DB_QUERY_TIMEOUT: number
  DB_RETRY_ATTEMPTS: number
  DB_RETRY_DELAY: number

  // WebSocket
  WS_HEARTBEAT_INTERVAL: number
  WS_HEARTBEAT_TIMEOUT: number
  WS_MAX_CONNECTIONS: number

  // Media Processing
  MEDIA_PROCESSING_ENABLED: boolean
  MEDIA_PROCESSING_WORKERS: number
  MEDIA_PROCESSING_TIMEOUT: number
}

class EnvironmentManager {
  private config: EnvironmentConfig

  constructor() {
    this.config = this.loadConfiguration()
    this.validateConfiguration()
  }

  private loadConfiguration(): EnvironmentConfig {
    return {
      // Core Application
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: parseInt(process.env.PORT || '3001'),
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001/api/v1',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

      // Database
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

      // Firebase
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
      FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,

      // Redis
      REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      REDIS_DB: parseInt(process.env.REDIS_DB || '0'),

      // JWT
      JWT_SECRET: process.env.JWT_SECRET || '',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

      // Payment Processing
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

      // File Upload
      MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
      UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
      ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,video/mp4,video/webm,audio/mpeg,audio/wav').split(','),

      // Security
      BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),
      SESSION_SECRET: process.env.SESSION_SECRET || '',
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

      // Rate Limiting
      RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),

      // Logging
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
      LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs/app.log',

      // Monitoring
      ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
      METRICS_PORT: parseInt(process.env.METRICS_PORT || '9090'),
      ENABLE_HEALTH_CHECKS: process.env.ENABLE_HEALTH_CHECKS === 'true',

      // External Services
      SENTRY_DSN: process.env.SENTRY_DSN,
      NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
      DATADOG_API_KEY: process.env.DATADOG_API_KEY,

      // Email
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,

      // AWS (Optional)
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,

      // CDN
      CDN_URL: process.env.CDN_URL,
      CDN_KEY: process.env.CDN_KEY,

      // Feature Flags
      FEATURE_USER_REGISTRATION: process.env.FEATURE_USER_REGISTRATION !== 'false',
      FEATURE_CREATOR_REGISTRATION: process.env.FEATURE_CREATOR_REGISTRATION !== 'false',
      FEATURE_PAYMENT_PROCESSING: process.env.FEATURE_PAYMENT_PROCESSING !== 'false',
      FEATURE_CONTENT_UPLOAD: process.env.FEATURE_CONTENT_UPLOAD !== 'false',
      FEATURE_MESSAGING: process.env.FEATURE_MESSAGING !== 'false',
      FEATURE_NOTIFICATIONS: process.env.FEATURE_NOTIFICATIONS !== 'false',
      FEATURE_ANALYTICS: process.env.FEATURE_ANALYTICS !== 'false',
      FEATURE_MODERATION: process.env.FEATURE_MODERATION !== 'false',

      // Content Moderation
      CONTENT_MODERATION_ENABLED: process.env.CONTENT_MODERATION_ENABLED === 'true',
      CONTENT_MODERATION_API_KEY: process.env.CONTENT_MODERATION_API_KEY,

      // Age Verification
      AGE_VERIFICATION_ENABLED: process.env.AGE_VERIFICATION_ENABLED === 'true',
      AGE_VERIFICATION_API_KEY: process.env.AGE_VERIFICATION_API_KEY,

      // DMCA
      DMCA_ENABLED: process.env.DMCA_ENABLED === 'true',
      DMCA_EMAIL: process.env.DMCA_EMAIL,

      // Legal Compliance
      LEGAL_COMPLIANCE_ENABLED: process.env.LEGAL_COMPLIANCE_ENABLED === 'true',
      LEGAL_COMPLIANCE_REGION: process.env.LEGAL_COMPLIANCE_REGION || 'US',
      LEGAL_COMPLIANCE_LAWS: (process.env.LEGAL_COMPLIANCE_LAWS || 'COPPA,CAN-SPAM,GDPR,CCPA').split(','),

      // Cache
      CACHE_TTL_DEFAULT: parseInt(process.env.CACHE_TTL_DEFAULT || '3600'),
      CACHE_TTL_USER: parseInt(process.env.CACHE_TTL_USER || '1800'),
      CACHE_TTL_POST: parseInt(process.env.CACHE_TTL_POST || '1800'),
      CACHE_TTL_FEED: parseInt(process.env.CACHE_TTL_FEED || '300'),

      // Database Pool
      DB_MAX_CONNECTIONS: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
      DB_CONNECTION_TIMEOUT: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
      DB_QUERY_TIMEOUT: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
      DB_RETRY_ATTEMPTS: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
      DB_RETRY_DELAY: parseInt(process.env.DB_RETRY_DELAY || '1000'),

      // WebSocket
      WS_HEARTBEAT_INTERVAL: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000'),
      WS_HEARTBEAT_TIMEOUT: parseInt(process.env.WS_HEARTBEAT_TIMEOUT || '60000'),
      WS_MAX_CONNECTIONS: parseInt(process.env.WS_MAX_CONNECTIONS || '1000'),

      // Media Processing
      MEDIA_PROCESSING_ENABLED: process.env.MEDIA_PROCESSING_ENABLED === 'true',
      MEDIA_PROCESSING_WORKERS: parseInt(process.env.MEDIA_PROCESSING_WORKERS || '4'),
      MEDIA_PROCESSING_TIMEOUT: parseInt(process.env.MEDIA_PROCESSING_TIMEOUT || '300000')
    }
  }

  private validateConfiguration(): void {
    const requiredFields = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET',
      'STRIPE_SECRET_KEY'
    ]

    const missingFields = requiredFields.filter(field => !this.config[field as keyof EnvironmentConfig])

    if (missingFields.length > 0) {
      const error = `Missing required environment variables: ${missingFields.join(', ')}`
      logger.error(error)
      throw new Error(error)
    }

    // Validate Firebase configuration if provided
    if (this.config.FIREBASE_PROJECT_ID) {
      const firebaseRequiredFields = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_STORAGE_BUCKET'
      ]

      const missingFirebaseFields = firebaseRequiredFields.filter(field => !this.config[field as keyof EnvironmentConfig])

      if (missingFirebaseFields.length > 0) {
        logger.warn(`Incomplete Firebase configuration. Missing: ${missingFirebaseFields.join(', ')}`)
      }
    }

    logger.info('Environment configuration validated successfully', {
      NODE_ENV: this.config.NODE_ENV,
      PORT: this.config.PORT,
      features: {
        userRegistration: this.config.FEATURE_USER_REGISTRATION,
        creatorRegistration: this.config.FEATURE_CREATOR_REGISTRATION,
        paymentProcessing: this.config.FEATURE_PAYMENT_PROCESSING,
        contentUpload: this.config.FEATURE_CONTENT_UPLOAD,
        messaging: this.config.FEATURE_MESSAGING,
        notifications: this.config.FEATURE_NOTIFICATIONS,
        analytics: this.config.FEATURE_ANALYTICS,
        moderation: this.config.FEATURE_MODERATION
      }
    })
  }

  public getConfig(): EnvironmentConfig {
    return this.config
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production'
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development'
  }

  public isTest(): boolean {
    return this.config.NODE_ENV === 'test'
  }

  public getFeatureFlag(feature: keyof Pick<EnvironmentConfig, 
    'FEATURE_USER_REGISTRATION' | 
    'FEATURE_CREATOR_REGISTRATION' | 
    'FEATURE_PAYMENT_PROCESSING' | 
    'FEATURE_CONTENT_UPLOAD' | 
    'FEATURE_MESSAGING' | 
    'FEATURE_NOTIFICATIONS' | 
    'FEATURE_ANALYTICS' | 
    'FEATURE_MODERATION'
  >): boolean {
    return this.config[feature]
  }
}

// Singleton instance
export const environmentManager = new EnvironmentManager()

// Export config for convenience
export const config = environmentManager.getConfig()
