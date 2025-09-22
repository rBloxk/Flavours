export declare const productionConfig: {
    server: {
        port: string | number;
        host: string;
        env: string;
        cors: {
            origin: string;
            credentials: boolean;
            methods: string[];
            allowedHeaders: string[];
            exposedHeaders: string[];
        };
    };
    database: {
        url: string | undefined;
        maxConnections: number;
        connectionTimeout: number;
        idleTimeout: number;
        ssl: boolean | {
            rejectUnauthorized: boolean;
        };
    };
    redis: {
        url: string | undefined;
        host: string;
        port: number;
        password: string | undefined;
        db: number;
        retryDelayOnFailover: number;
        maxRetriesPerRequest: number;
        lazyConnect: boolean;
        keepAlive: number;
        connectTimeout: number;
        commandTimeout: number;
    };
    supabase: {
        url: string | undefined;
        anonKey: string | undefined;
        serviceRoleKey: string | undefined;
        jwtSecret: string | undefined;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
        issuer: string;
        audience: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
        message: string;
        standardHeaders: boolean;
        legacyHeaders: boolean;
    };
    upload: {
        maxFileSize: number;
        allowedMimeTypes: string[];
        uploadPath: string;
        tempPath: string;
    };
    email: {
        provider: string;
        smtp: {
            host: string | undefined;
            port: number;
            secure: boolean;
            auth: {
                user: string | undefined;
                pass: string | undefined;
            };
        };
        sendgrid: {
            apiKey: string | undefined;
        };
        from: {
            name: string;
            email: string;
        };
    };
    payments: {
        stripe: {
            secretKey: string | undefined;
            publishableKey: string | undefined;
            webhookSecret: string | undefined;
        };
        paypal: {
            clientId: string | undefined;
            clientSecret: string | undefined;
            environment: string;
        };
        platformFee: number;
        minimumPayout: number;
    };
    storage: {
        provider: string;
        local: {
            path: string;
        };
        s3: {
            accessKeyId: string | undefined;
            secretAccessKey: string | undefined;
            region: string;
            bucket: string | undefined;
            endpoint: string | undefined;
        };
        cloudinary: {
            cloudName: string | undefined;
            apiKey: string | undefined;
            apiSecret: string | undefined;
        };
    };
    websocket: {
        cors: {
            origin: string;
            methods: string[];
            credentials: boolean;
        };
        transports: string[];
        pingTimeout: number;
        pingInterval: number;
    };
    monitoring: {
        sentry: {
            dsn: string | undefined;
            environment: string;
            tracesSampleRate: number;
        };
        newrelic: {
            licenseKey: string | undefined;
            appName: string;
        };
        prometheus: {
            enabled: boolean;
            port: number;
        };
    };
    security: {
        bcryptRounds: number;
        sessionSecret: string;
        csrfSecret: string;
        allowedOrigins: string[];
        trustedProxies: string[];
    };
    logging: {
        level: string;
        format: string;
        file: {
            enabled: boolean;
            path: string;
            maxSize: string;
            maxFiles: number;
        };
        console: {
            enabled: boolean;
        };
    };
    cache: {
        ttl: {
            default: number;
            user: number;
            content: number;
            analytics: number;
        };
        maxMemory: string;
    };
    features: {
        cams: boolean;
        flavourstalk: boolean;
        analytics: boolean;
        notifications: boolean;
        payments: boolean;
        moderation: boolean;
    };
    api: {
        version: string;
        prefix: string;
        timeout: number;
        maxRequestSize: string;
    };
    healthCheck: {
        enabled: boolean;
        path: string;
        interval: number;
    };
};
export default productionConfig;
//# sourceMappingURL=production.d.ts.map