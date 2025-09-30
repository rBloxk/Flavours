"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseUtils = exports.supabase = exports.databaseManager = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const logger_1 = require("../utils/logger");
class DatabaseManager {
    constructor() {
        this.connectionPool = new Map();
        this.isHealthy = true;
        this.lastHealthCheck = 0;
        this.config = {
            url: process.env.SUPABASE_URL || 'https://yrdwgiyfybnshhkznbaj.supabase.co',
            serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZHdnaXlmeWJuc2hoa3puYmFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwMjI2NSwiZXhwIjoyMDczNDc4MjY1fQ.fc8QJ_t-7rXP71P3acLs8JpeHYOt7z3JarZKX477fqI',
            maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
            connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
            queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
            retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
            retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000')
        };
        if (!this.config.url || !this.config.serviceKey) {
            throw new Error('Missing Supabase environment variables');
        }
        this.initializeConnection();
        this.startHealthCheck();
    }
    initializeConnection() {
        try {
            this.supabase = (0, supabase_js_1.createClient)(this.config.url, this.config.serviceKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                },
                db: {
                    schema: 'public'
                },
                global: {
                    headers: {
                        'x-application-name': 'flavours-backend',
                        'x-client-version': process.env.npm_package_version || '1.0.0'
                    }
                }
            });
            logger_1.logger.info('Database connection initialized', {
                url: this.config.url,
                maxConnections: this.config.maxConnections
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize database connection:', error);
            throw error;
        }
    }
    getClient() {
        if (!this.isHealthy) {
            throw new Error('Database is not healthy');
        }
        return this.supabase;
    }
    async executeQuery(query, retries = this.config.retryAttempts) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const startTime = Date.now();
                const result = await query();
                const duration = Date.now() - startTime;
                if (result.error) {
                    throw new Error(result.error.message || 'Database query failed');
                }
                if (duration > 1000) {
                    logger_1.logger.warn('Slow query detected', {
                        duration,
                        attempt
                    });
                }
                return result.data;
            }
            catch (error) {
                logger_1.logger.error(`Database query attempt ${attempt} failed:`, error);
                if (attempt === retries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
            }
        }
        throw new Error('All database query attempts failed');
    }
    async executeTransaction(operations) {
        const results = [];
        try {
            for (const operation of operations) {
                const result = await this.executeQuery(operation);
                results.push(result);
            }
            return results;
        }
        catch (error) {
            logger_1.logger.error('Transaction failed:', error);
            throw error;
        }
    }
    async healthCheck() {
        try {
            const startTime = Date.now();
            const { error } = await this.supabase
                .from('profiles')
                .select('id')
                .limit(1);
            const duration = Date.now() - startTime;
            if (error) {
                logger_1.logger.error('Database health check failed:', error);
                this.isHealthy = false;
                return false;
            }
            this.isHealthy = true;
            this.lastHealthCheck = Date.now();
            logger_1.logger.debug('Database health check passed', { duration });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Database health check error:', error);
            this.isHealthy = false;
            return false;
        }
    }
    startHealthCheck() {
        setInterval(async () => {
            await this.healthCheck();
        }, 30000);
    }
    getConnectionStats() {
        return {
            isHealthy: this.isHealthy,
            lastHealthCheck: this.lastHealthCheck,
            maxConnections: this.config.maxConnections,
            connectionTimeout: this.config.connectionTimeout,
            queryTimeout: this.config.queryTimeout
        };
    }
    async close() {
        try {
            logger_1.logger.info('Database connection closed');
        }
        catch (error) {
            logger_1.logger.error('Error closing database connection:', error);
        }
    }
}
exports.databaseManager = new DatabaseManager();
exports.supabase = exports.databaseManager.getClient();
class DatabaseUtils {
    static async paginate(query, page = 1, limit = 20, orderBy = 'created_at', orderDirection = 'desc') {
        try {
            const offset = (page - 1) * limit;
            const { count, error: countError } = await query.select('*', { count: 'exact', head: true });
            if (countError)
                throw countError;
            const { data, error } = await query
                .select('*')
                .order(orderBy, { ascending: orderDirection === 'asc' })
                .range(offset, offset + limit - 1);
            if (error)
                throw error;
            return {
                data: data || [],
                total: count || 0,
                page,
                limit
            };
        }
        catch (error) {
            logger_1.logger.error('Pagination error:', error);
            throw error;
        }
    }
    static async batchInsert(table, records, batchSize = 100) {
        const results = [];
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            const { data, error } = await exports.supabase
                .from(table)
                .insert(batch)
                .select();
            if (error) {
                logger_1.logger.error(`Batch insert error for ${table}:`, error);
                throw error;
            }
            results.push(...(data || []));
        }
        return results;
    }
    static async batchUpdate(table, updates, batchSize = 100) {
        const results = [];
        for (let i = 0; i < updates.length; i += batchSize) {
            const batch = updates.slice(i, i + batchSize);
            const promises = batch.map(update => exports.supabase
                .from(table)
                .update(update.data)
                .eq('id', update.id)
                .select()
                .single());
            const batchResults = await Promise.all(promises);
            for (const result of batchResults) {
                if (result.error) {
                    logger_1.logger.error(`Batch update error for ${table}:`, result.error);
                    throw result.error;
                }
                results.push(result.data);
            }
        }
        return results;
    }
    static async softDelete(table, id, deletedBy) {
        const { error } = await exports.supabase
            .from(table)
            .update({
            deleted_at: new Date().toISOString(),
            deleted_by: deletedBy
        })
            .eq('id', id);
        if (error) {
            logger_1.logger.error(`Soft delete error for ${table}:`, error);
            throw error;
        }
    }
    static async restore(table, id, restoredBy) {
        const { error } = await exports.supabase
            .from(table)
            .update({
            deleted_at: null,
            deleted_by: null,
            restored_at: new Date().toISOString(),
            restored_by: restoredBy
        })
            .eq('id', id);
        if (error) {
            logger_1.logger.error(`Restore error for ${table}:`, error);
            throw error;
        }
    }
}
exports.DatabaseUtils = DatabaseUtils;
//# sourceMappingURL=database.js.map