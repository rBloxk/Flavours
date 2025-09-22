import { Storage } from '@google-cloud/storage';
interface GCPConfig {
    projectId: string;
    region: string;
    zone: string;
    credentials?: string;
    keyFilename?: string;
}
declare class GCPManager {
    private config;
    private storage;
    private secretManager;
    private monitoring;
    private logging;
    private compute;
    private cloudSQL;
    private cloudCDN;
    constructor();
    private initializeServices;
    uploadFile(bucketName: string, fileName: string, fileBuffer: Buffer, metadata?: any): Promise<string>;
    deleteFile(bucketName: string, fileName: string): Promise<void>;
    getSignedUrl(bucketName: string, fileName: string, expiresIn?: number): Promise<string>;
    listFiles(bucketName: string, prefix?: string): Promise<any>;
    getSecret(secretName: string, version?: string): Promise<string | undefined>;
    createSecret(secretName: string, secretValue: string): Promise<void>;
    createMetric(metricName: string, value: number, labels?: Record<string, string>): Promise<void>;
    getMetrics(metricName: string, startTime: Date, endTime: Date): Promise<any>;
    writeLog(logName: string, message: string, severity?: string, labels?: Record<string, string>): Promise<void>;
    readLogs(logName: string, startTime: Date, endTime: Date, limit?: number): Promise<any>;
    getCloudSQLInstances(): Promise<any>;
    getCDNDistributions(): Promise<any>;
    healthCheck(): Promise<boolean>;
    getStorage(): Storage;
    getSecretManager(): import("@google-cloud/secret-manager/build/src/v1").SecretManagerServiceClient;
    getMonitoring(): MonitoringServiceClient;
    getLogging(): LoggingServiceClient;
    getCompute(): ComputeEngineClient;
    getCloudSQL(): CloudSQLClient;
    getCloudCDN(): CloudCDNClient;
    getConfig(): GCPConfig;
}
export declare const gcpManager: GCPManager;
export declare const gcpStorage: Storage;
export declare const gcpSecretManager: import("@google-cloud/secret-manager/build/src/v1").SecretManagerServiceClient;
export declare const gcpMonitoring: MonitoringServiceClient;
export declare const gcpLogging: LoggingServiceClient;
export declare const gcpCompute: ComputeEngineClient;
export declare const gcpCloudSQL: CloudSQLClient;
export declare const gcpCloudCDN: CloudCDNClient;
export {};
//# sourceMappingURL=gcp.d.ts.map