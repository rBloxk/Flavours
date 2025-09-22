export interface CacheConfig {
    url: string;
    password?: string;
    db: number;
    retryAttempts: number;
    retryDelay: number;
    defaultTTL: number;
    maxMemory: string;
    maxMemoryPolicy: string;
}
declare class RedisManager {
    private client;
    private config;
    private isConnected;
    private reconnectAttempts;
    private maxReconnectAttempts;
    constructor();
    private initializeConnection;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    expire(key: string, ttl: number): Promise<boolean>;
    keys(pattern: string): Promise<string[]>;
    flush(): Promise<boolean>;
    setex<T>(key: string, ttl: number, value: T): Promise<boolean>;
    lpush(key: string, ...values: string[]): Promise<number>;
    rpop(key: string): Promise<string | null>;
    llen(key: string): Promise<number>;
    healthCheck(): Promise<boolean>;
    getStats(): {
        isConnected: boolean;
        reconnectAttempts: number;
        config: CacheConfig;
    };
    close(): Promise<void>;
}
export declare const redisManager: RedisManager;
export declare class CacheUtils {
    static generateKey(prefix: string, ...parts: string[]): string;
    static getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T>;
    static invalidatePattern(pattern: string): Promise<void>;
    static cacheUser(userId: string, userData: any, ttl?: number): Promise<void>;
    static getCachedUser(userId: string): Promise<any | null>;
    static cachePost(postId: string, postData: any, ttl?: number): Promise<void>;
    static getCachedPost(postId: string): Promise<any | null>;
    static cacheFeed(userId: string, feedData: any[], ttl?: number): Promise<void>;
    static getCachedFeed(userId: string): Promise<any[] | null>;
    static cacheSession(sessionId: string, sessionData: any, ttl?: number): Promise<void>;
    static getCachedSession(sessionId: string): Promise<any | null>;
    static invalidateUserCache(userId: string): Promise<void>;
    static invalidatePostCache(postId: string): Promise<void>;
}
export {};
//# sourceMappingURL=redis.d.ts.map