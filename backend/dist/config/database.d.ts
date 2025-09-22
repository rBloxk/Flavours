export interface DatabaseConfig {
    url: string;
    serviceKey: string;
    maxConnections: number;
    connectionTimeout: number;
    queryTimeout: number;
    retryAttempts: number;
    retryDelay: number;
}
declare class DatabaseManager {
    private supabase;
    private config;
    private connectionPool;
    private isHealthy;
    private lastHealthCheck;
    constructor();
    private initializeConnection;
    getClient(): any;
    executeQuery<T>(query: () => Promise<{
        data: T | null;
        error: any;
    }>, retries?: number): Promise<T>;
    executeTransaction<T>(operations: Array<() => Promise<any>>): Promise<T[]>;
    healthCheck(): Promise<boolean>;
    private startHealthCheck;
    getConnectionStats(): {
        isHealthy: boolean;
        lastHealthCheck: number;
        maxConnections: number;
        connectionTimeout: number;
        queryTimeout: number;
    };
    close(): Promise<void>;
}
export declare const databaseManager: DatabaseManager;
export declare const supabase: any;
export declare class DatabaseUtils {
    static paginate<T>(query: any, page?: number, limit?: number, orderBy?: string, orderDirection?: 'asc' | 'desc'): Promise<{
        data: T[];
        total: number;
        page: number;
        limit: number;
    }>;
    static batchInsert<T>(table: string, records: T[], batchSize?: number): Promise<T[]>;
    static batchUpdate<T>(table: string, updates: Array<{
        id: string;
        data: Partial<T>;
    }>, batchSize?: number): Promise<T[]>;
    static softDelete(table: string, id: string, deletedBy?: string): Promise<void>;
    static restore(table: string, id: string, restoredBy?: string): Promise<void>;
}
export {};
//# sourceMappingURL=database.d.ts.map