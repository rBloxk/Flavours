"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.productionConfig = {
    server: {
        port: process.env.PORT || 3001,
        host: process.env.HOST || '0.0.0.0',
        env: process.env.NODE_ENV || 'production',
        cors: {
            origin: process.env.FRONTEND_URL || 'https://flavours.club',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
            exposedHeaders: ['X-Request-ID']
        }
    },
    database: {
        url: process.env.DATABASE_URL,
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
        connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
        idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    redis: {
        url: process.env.REDIS_URL,
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000
    },
    supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        jwtSecret: process.env.SUPABASE_JWT_SECRET
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: process.env.JWT_ISSUER || 'flavours-api',
        audience: process.env.JWT_AUDIENCE || 'flavours-app'
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'),
        allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'audio/mpeg',
            'audio/wav',
            'audio/ogg'
        ],
        uploadPath: process.env.UPLOAD_PATH || './uploads',
        tempPath: process.env.TEMP_PATH || './temp'
    },
    email: {
        provider: process.env.EMAIL_PROVIDER || 'smtp',
        smtp: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        },
        sendgrid: {
            apiKey: process.env.SENDGRID_API_KEY
        },
        from: {
            name: process.env.EMAIL_FROM_NAME || 'Flavours',
            email: process.env.EMAIL_FROM_EMAIL || 'noreply@flavours.club'
        }
    },
    payments: {
        stripe: {
            secretKey: process.env.STRIPE_SECRET_KEY,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
        },
        paypal: {
            clientId: process.env.PAYPAL_CLIENT_ID,
            clientSecret: process.env.PAYPAL_CLIENT_SECRET,
            environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox'
        },
        platformFee: parseFloat(process.env.PLATFORM_FEE || '0.05'),
        minimumPayout: parseFloat(process.env.MINIMUM_PAYOUT || '50.00')
    },
    storage: {
        provider: process.env.STORAGE_PROVIDER || 'local',
        local: {
            path: process.env.LOCAL_STORAGE_PATH || './storage'
        },
        s3: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'us-east-1',
            bucket: process.env.AWS_S3_BUCKET,
            endpoint: process.env.AWS_S3_ENDPOINT
        },
        cloudinary: {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET
        }
    },
    websocket: {
        cors: {
            origin: process.env.FRONTEND_URL || 'https://flavours.club',
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000
    },
    monitoring: {
        sentry: {
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV || 'production',
            tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1')
        },
        newrelic: {
            licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
            appName: process.env.NEW_RELIC_APP_NAME || 'Flavours API'
        },
        prometheus: {
            enabled: process.env.PROMETHEUS_ENABLED === 'true',
            port: parseInt(process.env.PROMETHEUS_PORT || '9090')
        }
    },
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
        sessionSecret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
        csrfSecret: process.env.CSRF_SECRET || 'your-super-secret-csrf-key',
        allowedOrigins: (process.env.ALLOWED_ORIGINS || 'https://flavours.club').split(','),
        trustedProxies: (process.env.TRUSTED_PROXIES || '').split(',').filter(Boolean)
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'json',
        file: {
            enabled: process.env.LOG_FILE_ENABLED === 'true',
            path: process.env.LOG_FILE_PATH || './logs/app.log',
            maxSize: process.env.LOG_FILE_MAX_SIZE || '10m',
            maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES || '5')
        },
        console: {
            enabled: process.env.LOG_CONSOLE_ENABLED !== 'false'
        }
    },
    cache: {
        ttl: {
            default: parseInt(process.env.CACHE_TTL_DEFAULT || '3600'),
            user: parseInt(process.env.CACHE_TTL_USER || '1800'),
            content: parseInt(process.env.CACHE_TTL_CONTENT || '7200'),
            analytics: parseInt(process.env.CACHE_TTL_ANALYTICS || '300')
        },
        maxMemory: process.env.CACHE_MAX_MEMORY || '512mb'
    },
    features: {
        cams: process.env.FEATURE_CAMS === 'true',
        flavourstalk: process.env.FEATURE_FLAVOURSTALK === 'true',
        analytics: process.env.FEATURE_ANALYTICS === 'true',
        notifications: process.env.FEATURE_NOTIFICATIONS === 'true',
        payments: process.env.FEATURE_PAYMENTS === 'true',
        moderation: process.env.FEATURE_MODERATION === 'true'
    },
    api: {
        version: process.env.API_VERSION || 'v1',
        prefix: process.env.API_PREFIX || '/api',
        timeout: parseInt(process.env.API_TIMEOUT || '30000'),
        maxRequestSize: process.env.API_MAX_REQUEST_SIZE || '10mb'
    },
    healthCheck: {
        enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
        path: process.env.HEALTH_CHECK_PATH || '/health',
        interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000')
    }
};
exports.default = exports.productionConfig;
//# sourceMappingURL=production.js.map