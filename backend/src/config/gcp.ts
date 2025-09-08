import { Storage } from '@google-cloud/storage'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
import { MonitoringServiceClient } from '@google-cloud/monitoring'
import { LoggingServiceClient } from '@google-cloud/logging'
import { ComputeEngineClient } from '@google-cloud/compute'
import { CloudSQLClient } from '@google-cloud/sql'
import { CloudCDNClient } from '@google-cloud/cdn'
import { logger } from '../utils/logger'

interface GCPConfig {
  projectId: string
  region: string
  zone: string
  credentials?: string
  keyFilename?: string
}

class GCPManager {
  private config: GCPConfig
  private storage: Storage
  private secretManager: SecretManagerServiceClient
  private monitoring: MonitoringServiceClient
  private logging: LoggingServiceClient
  private compute: ComputeEngineClient
  private cloudSQL: CloudSQLClient
  private cloudCDN: CloudCDNClient

  constructor() {
    this.config = {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
      region: process.env.GOOGLE_CLOUD_REGION || 'us-central1',
      zone: process.env.GOOGLE_CLOUD_ZONE || 'us-central1-a',
      credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
    }

    this.initializeServices()
  }

  private initializeServices() {
    try {
      const options: any = {
        projectId: this.config.projectId
      }

      if (this.config.credentials) {
        options.credentials = JSON.parse(this.config.credentials)
      } else if (this.config.keyFilename) {
        options.keyFilename = this.config.keyFilename
      }

      // Initialize services
      this.storage = new Storage(options)
      this.secretManager = new SecretManagerServiceClient(options)
      this.monitoring = new MonitoringServiceClient(options)
      this.logging = new LoggingServiceClient(options)
      this.compute = new ComputeEngineClient(options)
      this.cloudSQL = new CloudSQLClient(options)
      this.cloudCDN = new CloudCDNClient(options)

      logger.info('GCP services initialized successfully', {
        projectId: this.config.projectId,
        region: this.config.region,
        zone: this.config.zone
      })
    } catch (error) {
      logger.error('Failed to initialize GCP services:', error)
      throw error
    }
  }

  // Cloud Storage methods
  public async uploadFile(bucketName: string, fileName: string, fileBuffer: Buffer, metadata?: any) {
    try {
      const bucket = this.storage.bucket(bucketName)
      const file = bucket.file(fileName)

      await file.save(fileBuffer, {
        metadata: {
          contentType: metadata?.contentType || 'application/octet-stream',
          ...metadata
        }
      })

      // Make file publicly accessible if needed
      if (metadata?.public) {
        await file.makePublic()
      }

      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`
      
      logger.info('File uploaded to Cloud Storage successfully', { fileName, bucketName })
      return publicUrl
    } catch (error) {
      logger.error('Failed to upload file to Cloud Storage:', error)
      throw error
    }
  }

  public async deleteFile(bucketName: string, fileName: string) {
    try {
      const bucket = this.storage.bucket(bucketName)
      await bucket.file(fileName).delete()
      
      logger.info('File deleted from Cloud Storage successfully', { fileName, bucketName })
    } catch (error) {
      logger.error('Failed to delete file from Cloud Storage:', error)
      throw error
    }
  }

  public async getSignedUrl(bucketName: string, fileName: string, expiresIn: number = 3600) {
    try {
      const bucket = this.storage.bucket(bucketName)
      const file = bucket.file(fileName)

      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000
      })

      return signedUrl
    } catch (error) {
      logger.error('Failed to get signed URL:', error)
      throw error
    }
  }

  public async listFiles(bucketName: string, prefix?: string) {
    try {
      const bucket = this.storage.bucket(bucketName)
      const [files] = await bucket.getFiles({ prefix })

      return files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        created: file.metadata.timeCreated,
        updated: file.metadata.updated
      }))
    } catch (error) {
      logger.error('Failed to list files:', error)
      throw error
    }
  }

  // Secret Manager methods
  public async getSecret(secretName: string, version: string = 'latest') {
    try {
      const [secret] = await this.secretManager.accessSecretVersion({
        name: `projects/${this.config.projectId}/secrets/${secretName}/versions/${version}`
      })

      const secretValue = secret.payload?.data?.toString()
      return secretValue
    } catch (error) {
      logger.error('Failed to get secret:', error)
      throw error
    }
  }

  public async createSecret(secretName: string, secretValue: string) {
    try {
      const [secret] = await this.secretManager.createSecret({
        parent: `projects/${this.config.projectId}`,
        secretId: secretName,
        secret: {
          replication: {
            automatic: {}
          }
        }
      })

      await this.secretManager.addSecretVersion({
        parent: secret.name,
        payload: {
          data: Buffer.from(secretValue, 'utf8')
        }
      })

      logger.info('Secret created successfully', { secretName })
    } catch (error) {
      logger.error('Failed to create secret:', error)
      throw error
    }
  }

  // Cloud Monitoring methods
  public async createMetric(metricName: string, value: number, labels?: Record<string, string>) {
    try {
      const projectName = `projects/${this.config.projectId}`
      
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
      }

      await this.monitoring.createTimeSeries({
        name: projectName,
        timeSeries: [timeSeries]
      })

      logger.info('Metric created successfully', { metricName, value })
    } catch (error) {
      logger.error('Failed to create metric:', error)
      throw error
    }
  }

  public async getMetrics(metricName: string, startTime: Date, endTime: Date) {
    try {
      const projectName = `projects/${this.config.projectId}`
      
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
      })

      return timeSeries
    } catch (error) {
      logger.error('Failed to get metrics:', error)
      throw error
    }
  }

  // Cloud Logging methods
  public async writeLog(logName: string, message: string, severity: string = 'INFO', labels?: Record<string, string>) {
    try {
      const log = this.logging.log(`projects/${this.config.projectId}/logs/${logName}`)
      
      const entry = log.entry({
        resource: {
          type: 'global',
          labels: {
            project_id: this.config.projectId
          }
        },
        severity: severity,
        labels: labels || {}
      }, message)

      await log.write(entry)
      
      logger.info('Log written successfully', { logName, severity })
    } catch (error) {
      logger.error('Failed to write log:', error)
      throw error
    }
  }

  public async readLogs(logName: string, startTime: Date, endTime: Date, limit: number = 100) {
    try {
      const log = this.logging.log(`projects/${this.config.projectId}/logs/${logName}`)
      
      const [entries] = await log.getEntries({
        pageSize: limit,
        filter: `timestamp >= "${startTime.toISOString()}" AND timestamp <= "${endTime.toISOString()}"`
      })

      return entries.map(entry => ({
        timestamp: entry.metadata.timestamp,
        severity: entry.metadata.severity,
        message: entry.data,
        labels: entry.metadata.labels
      }))
    } catch (error) {
      logger.error('Failed to read logs:', error)
      throw error
    }
  }

  // Cloud SQL methods
  public async getCloudSQLInstances() {
    try {
      const [instances] = await this.cloudSQL.listInstances({
        project: this.config.projectId
      })

      return instances.map(instance => ({
        name: instance.name,
        state: instance.state,
        region: instance.region,
        databaseVersion: instance.databaseVersion,
        settings: instance.settings
      }))
    } catch (error) {
      logger.error('Failed to get Cloud SQL instances:', error)
      throw error
    }
  }

  // Cloud CDN methods
  public async getCDNDistributions() {
    try {
      const [distributions] = await this.cloudCDN.listBackendServices({
        project: this.config.projectId
      })

      return distributions.map(distribution => ({
        name: distribution.name,
        description: distribution.description,
        healthChecks: distribution.healthChecks,
        backends: distribution.backends
      }))
    } catch (error) {
      logger.error('Failed to get CDN distributions:', error)
      throw error
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      // Test Cloud Storage
      await this.storage.getBuckets()
      
      // Test Secret Manager
      await this.secretManager.listSecrets({
        parent: `projects/${this.config.projectId}`
      })
      
      logger.info('GCP health check passed')
      return true
    } catch (error) {
      logger.error('GCP health check failed:', error)
      return false
    }
  }

  // Get service instances
  public getStorage() { return this.storage }
  public getSecretManager() { return this.secretManager }
  public getMonitoring() { return this.monitoring }
  public getLogging() { return this.logging }
  public getCompute() { return this.compute }
  public getCloudSQL() { return this.cloudSQL }
  public getCloudCDN() { return this.cloudCDN }
  public getConfig() { return this.config }
}

// Singleton instance
export const gcpManager = new GCPManager()

// Export individual services for convenience
export const gcpStorage = gcpManager.getStorage()
export const gcpSecretManager = gcpManager.getSecretManager()
export const gcpMonitoring = gcpManager.getMonitoring()
export const gcpLogging = gcpManager.getLogging()
export const gcpCompute = gcpManager.getCompute()
export const gcpCloudSQL = gcpManager.getCloudSQL()
export const gcpCloudCDN = gcpManager.getCloudCDN()
