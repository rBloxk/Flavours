"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheUtils = exports.redisManager = void 0;
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
class RedisManager {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.config = {
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || '0'),
            retryAttempts: parseInt(process.env.REDIS_RETRY_ATTEMPTS || '3'),
            retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '1000'),
            defaultTTL: parseInt(process.env.REDIS_DEFAULT_TTL || '3600'),
            maxMemory: process.env.REDIS_MAX_MEMORY || '256mb',
            maxMemoryPolicy: process.env.REDIS_MAX_MEMORY_POLICY || 'allkeys-lru'
        };
        this.initializeConnection();
    }
    async initializeConnection() {
        try {
            if (this.config.url === 'redis://localhost:6379') {
                logger_1.logger.warn('Redis not available, running in cache-disabled mode');
                this.isConnected = false;
                return;
            }
            this.client = (0, redis_1.createClient)({
                url: this.config.url,
                password: this.config.password,
                database: this.config.db,
                socket: {
                    connectTimeout: 10000,
                    lazyConnect: true
                },
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        logger_1.logger.error('Redis connection refused');
                        return new Error('Redis connection refused');
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        logger_1.logger.error('Redis retry time exhausted');
                        return new Error('Redis retry time exhausted');
                    }
                    if (options.attempt > this.maxReconnectAttempts) {
                        logger_1.logger.error('Redis max reconnect attempts reached');
                        return undefined;
                    }
                    return Math.min(options.attempt * 100, 3000);
                }
            });
            this.client.on('connect', () => {
                logger_1.logger.info('Redis connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            });
            this.client.on('error', (error) => {
                logger_1.logger.error('Redis error:', error);
                this.isConnected = false;
            });
            this.client.on('end', () => {
                logger_1.logger.warn('Redis connection ended');
                this.isConnected = false;
            });
            this.client.on('reconnecting', () => {
                this.reconnectAttempts++;
                logger_1.logger.info(`Redis reconnecting (attempt ${this.reconnectAttempts})`);
            });
            await this.client.connect();
            await this.client.configSet('maxmemory', this.config.maxMemory);
            await this.client.configSet('maxmemory-policy', this.config.maxMemoryPolicy);
            logger_1.logger.info('Redis initialized successfully', {
                url: this.config.url,
                db: this.config.db,
                maxMemory: this.config.maxMemory
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize Redis:', error);
            this.isConnected = false;
        }
    }
    async get(key) {
        if (!this.isConnected || !this.client) {
            logger_1.logger.warn('Redis not connected, skipping cache get');
            return null;
        }
        try {
            const value = await this.client.get(key);
            if (value) {
                return JSON.parse(value);
            }
            return null;
        }
        catch (error) {
            logger_1.logger.error('Redis get error:', error);
            return null;
        }
    }
    async set(key, value, ttl) {
        if (!this.isConnected || !this.client) {
            logger_1.logger.warn('Redis not connected, skipping cache set');
            return false;
        }
        try {
            const serializedValue = JSON.stringify(value);
            const expirationTime = ttl || this.config.defaultTTL;
            await this.client.setEx(key, expirationTime, serializedValue);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Redis set error:', error);
            return false;
        }
    }
    async del(key) {
        if (!this.isConnected || !this.client) {
            logger_1.logger.warn('Redis not connected, skipping cache delete');
            return false;
        }
        try {
            await this.client.del(key);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Redis delete error:', error);
            return false;
        }
    }
    async exists(key) {
        if (!this.isConnected || !this.client) {
            return false;
        }
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            logger_1.logger.error('Redis exists error:', error);
            return false;
        }
    }
    async expire(key, ttl) {
        if (!this.isConnected || !this.client) {
            return false;
        }
        try {
            await this.client.expire(key, ttl);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Redis expire error:', error);
            return false;
        }
    }
    async keys(pattern) {
        if (!this.isConnected || !this.client) {
            return [];
        }
        try {
            return await this.client.keys(pattern);
        }
        catch (error) {
            logger_1.logger.error('Redis keys error:', error);
            return [];
        }
    }
    async flush() {
        if (!this.isConnected || !this.client) {
            return false;
        }
        try {
            await this.client.flushDb();
            return true;
        }
        catch (error) {
            logger_1.logger.error('Redis flush error:', error);
            return false;
        }
    }
    async setex(key, ttl, value) {
        return this.set(key, value, ttl);
    }
    async lpush(key, ...values) {
        if (!this.isConnected || !this.client) {
            return 0;
        }
        try {
            return await this.client.lPush(key, values);
        }
        catch (error) {
            logger_1.logger.error('Redis lpush error:', error);
            return 0;
        }
    }
    async rpop(key) {
        if (!this.isConnected || !this.client) {
            return null;
        }
        try {
            return await this.client.rPop(key);
        }
        catch (error) {
            logger_1.logger.error('Redis rpop error:', error);
            return null;
        }
    }
    async llen(key) {
        if (!this.isConnected || !this.client) {
            return 0;
        }
        try {
            return await this.client.lLen(key);
        }
        catch (error) {
            logger_1.logger.error('Redis llen error:', error);
            return 0;
        }
    }
    async healthCheck() {
        if (!this.isConnected || !this.client) {
            return false;
        }
        try {
            const pong = await this.client.ping();
            return pong === 'PONG';
        }
        catch (error) {
            logger_1.logger.error('Redis health check failed:', error);
            return false;
        }
    }
    getStats() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            config: this.config
        };
    }
    async close() {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
            logger_1.logger.info('Redis connection closed');
        }
    }
}
exports.redisManager = new RedisManager();
class CacheUtils {
    static generateKey(prefix, ...parts) {
        return `${prefix}:${parts.join(':')}`;
    }
    static async getOrSet(key, fetchFn, ttl) {
        const cached = await exports.redisManager.get(key);
        if (cached !== null) {
            return cached;
        }
        const data = await fetchFn();
        await exports.redisManager.set(key, data, ttl);
        return data;
    }
    static async invalidatePattern(pattern) {
        const keys = await exports.redisManager.keys(pattern);
        for (const key of keys) {
            await exports.redisManager.del(key);
        }
    }
    static async cacheUser(userId, userData, ttl = 3600) {
        const key = CacheUtils.generateKey('user', userId);
        await exports.redisManager.set(key, userData, ttl);
    }
    static async getCachedUser(userId) {
        const key = CacheUtils.generateKey('user', userId);
        return await exports.redisManager.get(key);
    }
    static async cachePost(postId, postData, ttl = 1800) {
        const key = CacheUtils.generateKey('post', postId);
        await exports.redisManager.set(key, postData, ttl);
    }
    static async getCachedPost(postId) {
        const key = CacheUtils.generateKey('post', postId);
        return await exports.redisManager.get(key);
    }
    static async cacheFeed(userId, feedData, ttl = 300) {
        const key = CacheUtils.generateKey('feed', userId);
        await exports.redisManager.set(key, feedData, ttl);
    }
    static async getCachedFeed(userId) {
        const key = CacheUtils.generateKey('feed', userId);
        return await exports.redisManager.get(key);
    }
    static async cacheSession(sessionId, sessionData, ttl = 86400) {
        const key = CacheUtils.generateKey('session', sessionId);
        await exports.redisManager.set(key, sessionData, ttl);
    }
    static async getCachedSession(sessionId) {
        const key = CacheUtils.generateKey('session', sessionId);
        return await exports.redisManager.get(key);
    }
    static async invalidateUserCache(userId) {
        await CacheUtils.invalidatePattern(`user:${userId}*`);
        await CacheUtils.invalidatePattern(`feed:${userId}*`);
    }
    static async invalidatePostCache(postId) {
        await CacheUtils.invalidatePattern(`post:${postId}*`);
        await CacheUtils.invalidatePattern('feed:*');
    }
}
exports.CacheUtils = CacheUtils;
//# sourceMappingURL=redis.js.map