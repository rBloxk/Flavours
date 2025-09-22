"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.environmentManager = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
class EnvironmentManager {
    constructor() {
        this.config = this.loadConfiguration();
        this.validateConfiguration();
    }
    loadConfiguration() {
        return {
            NODE_ENV: process.env.NODE_ENV || 'development',
            PORT: parseInt(process.env.PORT || '3001'),
            API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001/api/v1',
            FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
            SUPABASE_URL: process.env.SUPABASE_URL || '',
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
            FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
            FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
            FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
            FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
            REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
            REDIS_PASSWORD: process.env.REDIS_PASSWORD,
            REDIS_DB: parseInt(process.env.REDIS_DB || '0'),
            JWT_SECRET: process.env.JWT_SECRET || '',
            JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
            JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
            STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
            STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
            STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
            MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '3650722201'),
            UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
            ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,video/mp4,video/webm,audio/mpeg,audio/wav').split(','),
            BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),
            SESSION_SECRET: process.env.SESSION_SECRET || '',
            CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
            RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
            RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
            LOG_LEVEL: process.env.LOG_LEVEL || 'info',
            LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs/app.log',
            ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
            METRICS_PORT: parseInt(process.env.METRICS_PORT || '9090'),
            ENABLE_HEALTH_CHECKS: process.env.ENABLE_HEALTH_CHECKS === 'true',
            SENTRY_DSN: process.env.SENTRY_DSN,
            NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
            DATADOG_API_KEY: process.env.DATADOG_API_KEY,
            SMTP_HOST: process.env.SMTP_HOST,
            SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
            SMTP_USER: process.env.SMTP_USER,
            SMTP_PASS: process.env.SMTP_PASS,
            AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
            AWS_REGION: process.env.AWS_REGION,
            AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
            CDN_URL: process.env.CDN_URL,
            CDN_KEY: process.env.CDN_KEY,
            FEATURE_USER_REGISTRATION: process.env.FEATURE_USER_REGISTRATION !== 'false',
            FEATURE_CREATOR_REGISTRATION: process.env.FEATURE_CREATOR_REGISTRATION !== 'false',
            FEATURE_PAYMENT_PROCESSING: process.env.FEATURE_PAYMENT_PROCESSING !== 'false',
            FEATURE_CONTENT_UPLOAD: process.env.FEATURE_CONTENT_UPLOAD !== 'false',
            FEATURE_MESSAGING: process.env.FEATURE_MESSAGING !== 'false',
            FEATURE_NOTIFICATIONS: process.env.FEATURE_NOTIFICATIONS !== 'false',
            FEATURE_ANALYTICS: process.env.FEATURE_ANALYTICS !== 'false',
            FEATURE_MODERATION: process.env.FEATURE_MODERATION !== 'false',
            CONTENT_MODERATION_ENABLED: process.env.CONTENT_MODERATION_ENABLED === 'true',
            CONTENT_MODERATION_API_KEY: process.env.CONTENT_MODERATION_API_KEY,
            AGE_VERIFICATION_ENABLED: process.env.AGE_VERIFICATION_ENABLED === 'true',
            AGE_VERIFICATION_API_KEY: process.env.AGE_VERIFICATION_API_KEY,
            DMCA_ENABLED: process.env.DMCA_ENABLED === 'true',
            DMCA_EMAIL: process.env.DMCA_EMAIL,
            LEGAL_COMPLIANCE_ENABLED: process.env.LEGAL_COMPLIANCE_ENABLED === 'true',
            LEGAL_COMPLIANCE_REGION: process.env.LEGAL_COMPLIANCE_REGION || 'US',
            LEGAL_COMPLIANCE_LAWS: (process.env.LEGAL_COMPLIANCE_LAWS || 'COPPA,CAN-SPAM,GDPR,CCPA').split(','),
            CACHE_TTL_DEFAULT: parseInt(process.env.CACHE_TTL_DEFAULT || '3600'),
            CACHE_TTL_USER: parseInt(process.env.CACHE_TTL_USER || '1800'),
            CACHE_TTL_POST: parseInt(process.env.CACHE_TTL_POST || '1800'),
            CACHE_TTL_FEED: parseInt(process.env.CACHE_TTL_FEED || '300'),
            DB_MAX_CONNECTIONS: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
            DB_CONNECTION_TIMEOUT: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
            DB_QUERY_TIMEOUT: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
            DB_RETRY_ATTEMPTS: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
            DB_RETRY_DELAY: parseInt(process.env.DB_RETRY_DELAY || '1000'),
            WS_HEARTBEAT_INTERVAL: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000'),
            WS_HEARTBEAT_TIMEOUT: parseInt(process.env.WS_HEARTBEAT_TIMEOUT || '60000'),
            WS_MAX_CONNECTIONS: parseInt(process.env.WS_MAX_CONNECTIONS || '1000'),
            MEDIA_PROCESSING_ENABLED: process.env.MEDIA_PROCESSING_ENABLED === 'true',
            MEDIA_PROCESSING_WORKERS: parseInt(process.env.MEDIA_PROCESSING_WORKERS || '4'),
            MEDIA_PROCESSING_TIMEOUT: parseInt(process.env.MEDIA_PROCESSING_TIMEOUT || '300000')
        };
    }
    validateConfiguration() {
        const requiredFields = [
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY',
            'JWT_SECRET',
            'STRIPE_SECRET_KEY'
        ];
        const missingFields = requiredFields.filter(field => !this.config[field]);
        if (missingFields.length > 0) {
            const error = `Missing required environment variables: ${missingFields.join(', ')}`;
            logger_1.logger.error(error);
            throw new Error(error);
        }
        if (this.config.FIREBASE_PROJECT_ID) {
            const firebaseRequiredFields = [
                'FIREBASE_PROJECT_ID',
                'FIREBASE_PRIVATE_KEY',
                'FIREBASE_CLIENT_EMAIL',
                'FIREBASE_STORAGE_BUCKET'
            ];
            const missingFirebaseFields = firebaseRequiredFields.filter(field => !this.config[field]);
            if (missingFirebaseFields.length > 0) {
                logger_1.logger.warn(`Incomplete Firebase configuration. Missing: ${missingFirebaseFields.join(', ')}`);
            }
        }
        logger_1.logger.info('Environment configuration validated successfully', {
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
        });
    }
    getConfig() {
        return this.config;
    }
    isProduction() {
        return this.config.NODE_ENV === 'production';
    }
    isDevelopment() {
        return this.config.NODE_ENV === 'development';
    }
    isTest() {
        return this.config.NODE_ENV === 'test';
    }
    getFeatureFlag(feature) {
        return this.config[feature];
    }
}
exports.environmentManager = new EnvironmentManager();
exports.config = exports.environmentManager.getConfig();
//# sourceMappingURL=environment.js.map