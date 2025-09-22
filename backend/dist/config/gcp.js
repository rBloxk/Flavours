"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gcpCloudCDN = exports.gcpCloudSQL = exports.gcpCompute = exports.gcpLogging = exports.gcpMonitoring = exports.gcpSecretManager = exports.gcpStorage = exports.gcpManager = void 0;
const storage_1 = require("@google-cloud/storage");
const secret_manager_1 = require("@google-cloud/secret-manager");
const monitoring_1 = require("@google-cloud/monitoring");
const logging_1 = require("@google-cloud/logging");
const compute_1 = require("@google-cloud/compute");
const sql_1 = require("@google-cloud/sql");
const cdn_1 = require("@google-cloud/cdn");
const logger_1 = require("../utils/logger");
class GCPManager {
    constructor() {
        this.config = {
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
            region: process.env.GOOGLE_CLOUD_REGION || 'us-central1',
            zone: process.env.GOOGLE_CLOUD_ZONE || 'us-central1-a',
            credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
        };
        this.initializeServices();
    }
    initializeServices() {
        try {
            const options = {
                projectId: this.config.projectId
            };
            if (this.config.credentials) {
                options.credentials = JSON.parse(this.config.credentials);
            }
            else if (this.config.keyFilename) {
                options.keyFilename = this.config.keyFilename;
            }
            this.storage = new storage_1.Storage(options);
            this.secretManager = new secret_manager_1.SecretManagerServiceClient(options);
            this.monitoring = new monitoring_1.MonitoringServiceClient(options);
            this.logging = new logging_1.LoggingServiceClient(options);
            this.compute = new compute_1.ComputeEngineClient(options);
            this.cloudSQL = new sql_1.CloudSQLClient(options);
            this.cloudCDN = new cdn_1.CloudCDNClient(options);
            logger_1.logger.info('GCP services initialized successfully', {
                projectId: this.config.projectId,
                region: this.config.region,
                zone: this.config.zone
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize GCP services:', error);
            throw error;
        }
    }
    async uploadFile(bucketName, fileName, fileBuffer, metadata) {
        try {
            const bucket = this.storage.bucket(bucketName);
            const file = bucket.file(fileName);
            await file.save(fileBuffer, {
                metadata: {
                    contentType: metadata?.contentType || 'application/octet-stream',
                    ...metadata
                }
            });
            if (metadata?.public) {
                await file.makePublic();
            }
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
            logger_1.logger.info('File uploaded to Cloud Storage successfully', { fileName, bucketName });
            return publicUrl;
        }
        catch (error) {
            logger_1.logger.error('Failed to upload file to Cloud Storage:', error);
            throw error;
        }
    }
    async deleteFile(bucketName, fileName) {
        try {
            const bucket = this.storage.bucket(bucketName);
            await bucket.file(fileName).delete();
            logger_1.logger.info('File deleted from Cloud Storage successfully', { fileName, bucketName });
        }
        catch (error) {
            logger_1.logger.error('Failed to delete file from Cloud Storage:', error);
            throw error;
        }
    }
    async getSignedUrl(bucketName, fileName, expiresIn = 3600) {
        try {
            const bucket = this.storage.bucket(bucketName);
            const file = bucket.file(fileName);
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + expiresIn * 1000
            });
            return signedUrl;
        }
        catch (error) {
            logger_1.logger.error('Failed to get signed URL:', error);
            throw error;
        }
    }
    async listFiles(bucketName, prefix) {
        try {
            const bucket = this.storage.bucket(bucketName);
            const [files] = await bucket.getFiles({ prefix });
            return files.map(file => ({
                name: file.name,
                size: file.metadata.size,
                contentType: file.metadata.contentType,
                created: file.metadata.timeCreated,
                updated: file.metadata.updated
            }));
        }
        catch (error) {
            logger_1.logger.error('Failed to list files:', error);
            throw error;
        }
    }
    async getSecret(secretName, version = 'latest') {
        try {
            const [secret] = await this.secretManager.accessSecretVersion({
                name: `projects/${this.config.projectId}/secrets/${secretName}/versions/${version}`
            });
            const secretValue = secret.payload?.data?.toString();
            return secretValue;
        }
        catch (error) {
            logger_1.logger.error('Failed to get secret:', error);
            throw error;
        }
    }
    async createSecret(secretName, secretValue) {
        try {
            const [secret] = await this.secretManager.createSecret({
                parent: `projects/${this.config.projectId}`,
                secretId: secretName,
                secret: {
                    replication: {
                        automatic: {}
                    }
                }
            });
            await this.secretManager.addSecretVersion({
                parent: secret.name,
                payload: {
                    data: Buffer.from(secretValue, 'utf8')
                }
            });
            logger_1.logger.info('Secret created successfully', { secretName });
        }
        catch (error) {
            logger_1.logger.error('Failed to create secret:', error);
            throw error;
        }
    }
    async createMetric(metricName, value, labels) {
        try {
            const projectName = `projects/${this.config.projectId}`;
            const timeSeries = {
                metric: {
                    type: `custom.googleapis.com/${metricName}`,
                    labels: labels || {}
                },
                resource: {
                    type: 'global',
                    labels: {
                        project_id: this.config.projectId
                    }
                },
                points: [{
                        interval: {
                            endTime: {
                                seconds: Date.now() / 1000
                            }
                        },
                        value: {
                            doubleValue: value
                        }
                    }]
            };
            await this.monitoring.createTimeSeries({
                name: projectName,
                timeSeries: [timeSeries]
            });
            logger_1.logger.info('Metric created successfully', { metricName, value });
        }
        catch (error) {
            logger_1.logger.error('Failed to create metric:', error);
            throw error;
        }
    }
    async getMetrics(metricName, startTime, endTime) {
        try {
            const projectName = `projects/${this.config.projectId}`;
            const [timeSeries] = await this.monitoring.listTimeSeries({
                name: projectName,
                filter: `metric.type="custom.googleapis.com/${metricName}"`,
                interval: {
                    startTime: {
                        seconds: startTime.getTime() / 1000
                    },
                    endTime: {
                        seconds: endTime.getTime() / 1000
                    }
                }
            });
            return timeSeries;
        }
        catch (error) {
            logger_1.logger.error('Failed to get metrics:', error);
            throw error;
        }
    }
    async writeLog(logName, message, severity = 'INFO', labels) {
        try {
            const log = this.logging.log(`projects/${this.config.projectId}/logs/${logName}`);
            const entry = log.entry({
                resource: {
                    type: 'global',
                    labels: {
                        project_id: this.config.projectId
                    }
                },
                severity: severity,
                labels: labels || {}
            }, message);
            await log.write(entry);
            logger_1.logger.info('Log written successfully', { logName, severity });
        }
        catch (error) {
            logger_1.logger.error('Failed to write log:', error);
            throw error;
        }
    }
    async readLogs(logName, startTime, endTime, limit = 100) {
        try {
            const log = this.logging.log(`projects/${this.config.projectId}/logs/${logName}`);
            const [entries] = await log.getEntries({
                pageSize: limit,
                filter: `timestamp >= "${startTime.toISOString()}" AND timestamp <= "${endTime.toISOString()}"`
            });
            return entries.map(entry => ({
                timestamp: entry.metadata.timestamp,
                severity: entry.metadata.severity,
                message: entry.data,
                labels: entry.metadata.labels
            }));
        }
        catch (error) {
            logger_1.logger.error('Failed to read logs:', error);
            throw error;
        }
    }
    async getCloudSQLInstances() {
        try {
            const [instances] = await this.cloudSQL.listInstances({
                project: this.config.projectId
            });
            return instances.map(instance => ({
                name: instance.name,
                state: instance.state,
                region: instance.region,
                databaseVersion: instance.databaseVersion,
                settings: instance.settings
            }));
        }
        catch (error) {
            logger_1.logger.error('Failed to get Cloud SQL instances:', error);
            throw error;
        }
    }
    async getCDNDistributions() {
        try {
            const [distributions] = await this.cloudCDN.listBackendServices({
                project: this.config.projectId
            });
            return distributions.map(distribution => ({
                name: distribution.name,
                description: distribution.description,
                healthChecks: distribution.healthChecks,
                backends: distribution.backends
            }));
        }
        catch (error) {
            logger_1.logger.error('Failed to get CDN distributions:', error);
            throw error;
        }
    }
    async healthCheck() {
        try {
            await this.storage.getBuckets();
            await this.secretManager.listSecrets({
                parent: `projects/${this.config.projectId}`
            });
            logger_1.logger.info('GCP health check passed');
            return true;
        }
        catch (error) {
            logger_1.logger.error('GCP health check failed:', error);
            return false;
        }
    }
    getStorage() { return this.storage; }
    getSecretManager() { return this.secretManager; }
    getMonitoring() { return this.monitoring; }
    getLogging() { return this.logging; }
    getCompute() { return this.compute; }
    getCloudSQL() { return this.cloudSQL; }
    getCloudCDN() { return this.cloudCDN; }
    getConfig() { return this.config; }
}
exports.gcpManager = new GCPManager();
exports.gcpStorage = exports.gcpManager.getStorage();
exports.gcpSecretManager = exports.gcpManager.getSecretManager();
exports.gcpMonitoring = exports.gcpManager.getMonitoring();
exports.gcpLogging = exports.gcpManager.getLogging();
exports.gcpCompute = exports.gcpManager.getCompute();
exports.gcpCloudSQL = exports.gcpManager.getCloudSQL();
exports.gcpCloudCDN = exports.gcpManager.getCloudCDN();
//# sourceMappingURL=gcp.js.map