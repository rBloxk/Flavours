/**
 * Media Security Configuration
 * Centralized configuration for all media protection features
 */

export interface MediaSecurityConfig {
  // DRM Settings
  drm: {
    enabled: boolean
    provider: 'widevine' | 'playready' | 'fairplay' | 'custom'
    licenseServer: string
    encryptionKey: string
  }
  
  // Watermarking Settings
  watermarking: {
    enabled: boolean
    type: 'text' | 'image' | 'dynamic'
    opacity: number
    position: 'center' | 'corner' | 'scattered'
    includeUserInfo: boolean
    includeTimestamp: boolean
  }
  
  // Streaming Protection
  streaming: {
    enabled: boolean
    maxConcurrentStreams: number
    tokenExpirationMinutes: number
    enableHLS: boolean
    enableDASH: boolean
    segmentEncryption: boolean
  }
  
  // Access Control
  accessControl: {
    enabled: boolean
    requireAuthentication: boolean
    checkSubscription: boolean
    checkPayment: boolean
    allowOffline: boolean
    maxDevices: number
  }
  
  // Anti-Piracy Measures
  antiPiracy: {
    enabled: boolean
    detectScreenCapture: boolean
    detectDevTools: boolean
    detectIframeEmbedding: boolean
    detectDownloadAttempts: boolean
    logSuspiciousActivity: boolean
    blockSuspiciousIPs: boolean
  }
  
  // Client Protection
  clientProtection: {
    disableRightClick: boolean
    disableKeyboardShortcuts: boolean
    disableTextSelection: boolean
    disableImageSaving: boolean
    disableDragDrop: boolean
    disablePrintScreen: boolean
    blurOnDevTools: boolean
  }
  
  // Monitoring & Logging
  monitoring: {
    enabled: boolean
    logLevel: 'debug' | 'info' | 'warn' | 'error'
    sendToAnalytics: boolean
    alertOnSuspiciousActivity: boolean
    retentionDays: number
  }
  
  // Performance Settings
  performance: {
    enableCaching: boolean
    cacheExpirationMinutes: number
    enableCompression: boolean
    maxFileSize: number // in MB
    enableProgressiveLoading: boolean
  }
}

// Default configuration for development
export const defaultMediaSecurityConfig: MediaSecurityConfig = {
  drm: {
    enabled: false, // Disabled in development
    provider: 'custom',
    licenseServer: 'https://license.flavours.app',
    encryptionKey: process.env.MEDIA_ENCRYPTION_KEY || 'dev-key-change-in-production'
  },
  
  watermarking: {
    enabled: true,
    type: 'dynamic',
    opacity: 0.1,
    position: 'scattered',
    includeUserInfo: true,
    includeTimestamp: true
  },
  
  streaming: {
    enabled: true,
    maxConcurrentStreams: 3,
    tokenExpirationMinutes: 60,
    enableHLS: true,
    enableDASH: true,
    segmentEncryption: true
  },
  
  accessControl: {
    enabled: true,
    requireAuthentication: true,
    checkSubscription: true,
    checkPayment: true,
    allowOffline: false,
    maxDevices: 3
  },
  
  antiPiracy: {
    enabled: true,
    detectScreenCapture: true,
    detectDevTools: true,
    detectIframeEmbedding: true,
    detectDownloadAttempts: true,
    logSuspiciousActivity: true,
    blockSuspiciousIPs: false // Disabled in development
  },
  
  clientProtection: {
    disableRightClick: true,
    disableKeyboardShortcuts: true,
    disableTextSelection: true,
    disableImageSaving: true,
    disableDragDrop: true,
    disablePrintScreen: true,
    blurOnDevTools: false // Disabled in development
  },
  
  monitoring: {
    enabled: true,
    logLevel: 'info',
    sendToAnalytics: false, // Disabled in development
    alertOnSuspiciousActivity: true,
    retentionDays: 30
  },
  
  performance: {
    enableCaching: true,
    cacheExpirationMinutes: 60,
    enableCompression: true,
    maxFileSize: 100, // 100MB
    enableProgressiveLoading: true
  }
}

// Production configuration
export const productionMediaSecurityConfig: MediaSecurityConfig = {
  drm: {
    enabled: true,
    provider: 'widevine',
    licenseServer: 'https://license.flavours.app',
    encryptionKey: process.env.MEDIA_ENCRYPTION_KEY!
  },
  
  watermarking: {
    enabled: true,
    type: 'dynamic',
    opacity: 0.15,
    position: 'scattered',
    includeUserInfo: true,
    includeTimestamp: true
  },
  
  streaming: {
    enabled: true,
    maxConcurrentStreams: 2, // Stricter in production
    tokenExpirationMinutes: 30, // Shorter expiration
    enableHLS: true,
    enableDASH: true,
    segmentEncryption: true
  },
  
  accessControl: {
    enabled: true,
    requireAuthentication: true,
    checkSubscription: true,
    checkPayment: true,
    allowOffline: false,
    maxDevices: 2 // Stricter in production
  },
  
  antiPiracy: {
    enabled: true,
    detectScreenCapture: true,
    detectDevTools: true,
    detectIframeEmbedding: true,
    detectDownloadAttempts: true,
    logSuspiciousActivity: true,
    blockSuspiciousIPs: true
  },
  
  clientProtection: {
    disableRightClick: true,
    disableKeyboardShortcuts: true,
    disableTextSelection: true,
    disableImageSaving: true,
    disableDragDrop: true,
    disablePrintScreen: true,
    blurOnDevTools: true
  },
  
  monitoring: {
    enabled: true,
    logLevel: 'warn',
    sendToAnalytics: true,
    alertOnSuspiciousActivity: true,
    retentionDays: 90
  },
  
  performance: {
    enableCaching: true,
    cacheExpirationMinutes: 30,
    enableCompression: true,
    maxFileSize: 50, // 50MB in production
    enableProgressiveLoading: true
  }
}

// Get configuration based on environment
export function getMediaSecurityConfig(): MediaSecurityConfig {
  const isProduction = process.env.NODE_ENV === 'production'
  return isProduction ? productionMediaSecurityConfig : defaultMediaSecurityConfig
}

// Configuration validation
export function validateMediaSecurityConfig(config: MediaSecurityConfig): string[] {
  const errors: string[] = []
  
  if (config.drm.enabled && !config.drm.licenseServer) {
    errors.push('DRM license server is required when DRM is enabled')
  }
  
  if (config.drm.enabled && !config.drm.encryptionKey) {
    errors.push('DRM encryption key is required when DRM is enabled')
  }
  
  if (config.streaming.maxConcurrentStreams < 1) {
    errors.push('Max concurrent streams must be at least 1')
  }
  
  if (config.streaming.tokenExpirationMinutes < 1) {
    errors.push('Token expiration must be at least 1 minute')
  }
  
  if (config.accessControl.maxDevices < 1) {
    errors.push('Max devices must be at least 1')
  }
  
  if (config.performance.maxFileSize < 1) {
    errors.push('Max file size must be at least 1MB')
  }
  
  if (config.watermarking.opacity < 0 || config.watermarking.opacity > 1) {
    errors.push('Watermark opacity must be between 0 and 1')
  }
  
  return errors
}

// Feature flags for gradual rollout
export const mediaSecurityFeatureFlags = {
  enableDRM: process.env.ENABLE_DRM === 'true',
  enableAdvancedWatermarking: process.env.ENABLE_ADVANCED_WATERMARKING === 'true',
  enableRealTimeMonitoring: process.env.ENABLE_REAL_TIME_MONITORING === 'true',
  enableMLBasedDetection: process.env.ENABLE_ML_DETECTION === 'true',
  enableBlockchainVerification: process.env.ENABLE_BLOCKCHAIN_VERIFICATION === 'true'
}
