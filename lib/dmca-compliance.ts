/**
 * DMCA Compliance and Copyright Protection System
 * Handles takedown requests, copyright infringement, and legal compliance
 */

export interface DMCARequest {
  id: string
  type: 'takedown' | 'counter_notice' | 'retraction'
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Reporter information
  reporter: {
    name: string
    email: string
    phone?: string
    address: string
    organization?: string
    isCopyrightOwner: boolean
    isAuthorizedAgent: boolean
  }
  
  // Content information
  content: {
    id: string
    url: string
    title?: string
    description?: string
    type: 'image' | 'video' | 'audio' | 'text' | 'other'
    size?: number
    uploadDate: string
    creatorId: string
  }
  
  // Copyright information
  copyright: {
    workTitle: string
    workType: string
    originalCreationDate: string
    copyrightRegistration?: string
    copyrightOwner: string
    description: string
  }
  
  // Legal information
  legal: {
    goodFaithBelief: boolean
    accuracyStatement: boolean
    perjuryStatement: boolean
    authorizationStatement: boolean
    contactConsent: boolean
  }
  
  // Evidence and documentation
  evidence: {
    screenshots: string[]
    originalWork: string[]
    comparisonAnalysis?: string
    additionalDocuments: string[]
  }
  
  // Processing information
  processing: {
    submittedAt: string
    reviewedAt?: string
    resolvedAt?: string
    reviewedBy?: string
    resolution?: string
    notes?: string
  }
  
  // Legal actions
  legalActions?: {
    courtCase?: string
    legalNotice?: string
    settlement?: string
    otherActions: string[]
  }
}

export interface DMCAComplianceConfig {
  enableAutomatedProcessing: boolean
  enableLegalReview: boolean
  enableCounterNotice: boolean
  enableRepeatInfringerPolicy: boolean
  enableContentID: boolean
  responseTimeHours: number
  legalReviewRequired: boolean
  notificationChannels: string[]
  escalationThreshold: number
}

export interface RepeatInfringerRecord {
  userId: string
  violations: number
  firstViolation: string
  lastViolation: string
  status: 'active' | 'suspended' | 'banned'
  actions: string[]
}

export class DMCAComplianceService {
  private static instance: DMCAComplianceService
  private config: DMCAComplianceConfig
  private dmcaRequests: Map<string, DMCARequest> = new Map()
  private repeatInfringers: Map<string, RepeatInfringerRecord> = new Map()
  private contentIDDatabase: Map<string, string[]> = new Map() // content hash -> copyright info

  constructor(config: DMCAComplianceConfig) {
    this.config = config
  }

  static getInstance(config?: DMCAComplianceConfig): DMCAComplianceService {
    if (!DMCAComplianceService.instance) {
      DMCAComplianceService.instance = new DMCAComplianceService(
        config || {
          enableAutomatedProcessing: true,
          enableLegalReview: true,
          enableCounterNotice: true,
          enableRepeatInfringerPolicy: true,
          enableContentID: true,
          responseTimeHours: 24,
          legalReviewRequired: true,
          notificationChannels: ['email', 'legal_portal'],
          escalationThreshold: 3
        }
      )
    }
    return DMCAComplianceService.instance
  }

  /**
   * Submit a DMCA takedown request
   */
  async submitDMCARequest(requestData: Omit<DMCARequest, 'id' | 'status' | 'processing'>): Promise<DMCARequest> {
    const request: DMCARequest = {
      ...requestData,
      id: this.generateRequestId(),
      status: 'pending',
      processing: {
        submittedAt: new Date().toISOString()
      }
    }

    // Validate request
    const validation = this.validateDMCARequest(request)
    if (!validation.isValid) {
      throw new Error(`Invalid DMCA request: ${validation.errors.join(', ')}`)
    }

    // Store the request
    this.dmcaRequests.set(request.id, request)

    // Process the request
    await this.processDMCARequest(request)

    // Notify relevant parties
    await this.notifyDMCARequest(request)

    return request
  }

  /**
   * Process a DMCA request
   */
  private async processDMCARequest(request: DMCARequest): Promise<void> {
    try {
      // Automated initial processing
      if (this.config.enableAutomatedProcessing) {
        await this.performAutomatedProcessing(request)
      }

      // Check for repeat infringer
      if (this.config.enableRepeatInfringerPolicy) {
        await this.checkRepeatInfringer(request)
      }

      // Content ID matching
      if (this.config.enableContentID) {
        await this.performContentIDMatching(request)
      }

      // Legal review if required
      if (this.config.legalReviewRequired) {
        request.status = 'under_review'
        await this.scheduleLegalReview(request)
      } else {
        await this.processRequestDecision(request)
      }

    } catch (error) {
      console.error('DMCA processing error:', error)
      request.status = 'pending'
      request.processing.notes = `Processing error: ${error}`
    }
  }

  /**
   * Perform automated processing
   */
  private async performAutomatedProcessing(request: DMCARequest): Promise<void> {
    // Check if content exists
    const contentExists = await this.verifyContentExists(request.content.id)
    if (!contentExists) {
      request.status = 'rejected'
      request.processing.resolution = 'Content not found'
      request.processing.resolvedAt = new Date().toISOString()
      return
    }

    // Verify reporter information
    const reporterValid = await this.verifyReporterInformation(request.reporter)
    if (!reporterValid) {
      request.status = 'rejected'
      request.processing.resolution = 'Invalid reporter information'
      request.processing.resolvedAt = new Date().toISOString()
      return
    }

    // Check for obvious false claims
    const isFalseClaim = await this.detectFalseClaim(request)
    if (isFalseClaim) {
      request.status = 'rejected'
      request.processing.resolution = 'False claim detected'
      request.processing.resolvedAt = new Date().toISOString()
      return
    }

    // Automated approval for clear cases
    if (this.isClearInfringement(request)) {
      request.status = 'approved'
      await this.executeTakedown(request)
    }
  }

  /**
   * Check for repeat infringer
   */
  private async checkRepeatInfringer(request: DMCARequest): Promise<void> {
    const userId = request.content.creatorId
    const existingRecord = this.repeatInfringers.get(userId)

    if (existingRecord) {
      existingRecord.violations++
      existingRecord.lastViolation = new Date().toISOString()
      
      // Check if user should be suspended/banned
      if (existingRecord.violations >= this.config.escalationThreshold) {
        existingRecord.status = 'suspended'
        await this.suspendUser(userId, 'Repeat copyright infringement')
      }
      
      this.repeatInfringers.set(userId, existingRecord)
    } else {
      // Create new record
      const newRecord: RepeatInfringerRecord = {
        userId,
        violations: 1,
        firstViolation: new Date().toISOString(),
        lastViolation: new Date().toISOString(),
        status: 'active',
        actions: ['dmca_notice_sent']
      }
      this.repeatInfringers.set(userId, newRecord)
    }
  }

  /**
   * Perform Content ID matching
   */
  private async performContentIDMatching(request: DMCARequest): Promise<void> {
    // Generate content hash
    const contentHash = await this.generateContentHash(request.content.id)
    
    // Check against known copyrighted content
    const matches = this.contentIDDatabase.get(contentHash)
    if (matches && matches.length > 0) {
      request.processing.notes = `Content ID match found: ${matches.join(', ')}`
      request.status = 'approved'
      await this.executeTakedown(request)
    }
  }

  /**
   * Execute takedown action
   */
  private async executeTakedown(request: DMCARequest): Promise<void> {
    try {
      // Remove content from platform
      await this.removeContent(request.content.id)
      
      // Notify content creator
      await this.notifyContentCreator(request)
      
      // Update request status
      request.status = 'resolved'
      request.processing.resolvedAt = new Date().toISOString()
      request.processing.resolution = 'Content removed due to copyright infringement'
      
      // Log the action
      this.logDMCAAction(request, 'takedown_executed')
      
    } catch (error) {
      console.error('Takedown execution error:', error)
      request.processing.notes = `Takedown failed: ${error}`
    }
  }

  /**
   * Submit counter notice
   */
  async submitCounterNotice(
    originalRequestId: string,
    counterNoticeData: {
      name: string
      email: string
      address: string
      phone?: string
      goodFaithBelief: boolean
      accuracyStatement: boolean
      perjuryStatement: boolean
      consentToJurisdiction: boolean
    }
  ): Promise<DMCARequest> {
    const originalRequest = this.dmcaRequests.get(originalRequestId)
    if (!originalRequest) {
      throw new Error('Original DMCA request not found')
    }

    const counterNotice: DMCARequest = {
      id: this.generateRequestId(),
      type: 'counter_notice',
      status: 'pending',
      priority: 'high',
      reporter: {
        name: counterNoticeData.name,
        email: counterNoticeData.email,
        address: counterNoticeData.address,
        phone: counterNoticeData.phone,
        isCopyrightOwner: false,
        isAuthorizedAgent: false
      },
      content: originalRequest.content,
      copyright: originalRequest.copyright,
      legal: {
        goodFaithBelief: counterNoticeData.goodFaithBelief,
        accuracyStatement: counterNoticeData.accuracyStatement,
        perjuryStatement: counterNoticeData.perjuryStatement,
        authorizationStatement: false,
        contactConsent: counterNoticeData.consentToJurisdiction
      },
      evidence: {
        screenshots: [],
        originalWork: [],
        additionalDocuments: []
      },
      processing: {
        submittedAt: new Date().toISOString()
      }
    }

    // Store counter notice
    this.dmcaRequests.set(counterNotice.id, counterNotice)

    // Process counter notice
    await this.processCounterNotice(counterNotice, originalRequest)

    return counterNotice
  }

  /**
   * Process counter notice
   */
  private async processCounterNotice(counterNotice: DMCARequest, originalRequest: DMCARequest): Promise<void> {
    // Validate counter notice
    const validation = this.validateCounterNotice(counterNotice)
    if (!validation.isValid) {
      counterNotice.status = 'rejected'
      counterNotice.processing.resolution = `Invalid counter notice: ${validation.errors.join(', ')}`
      return
    }

    // Notify original reporter
    await this.notifyOriginalReporter(counterNotice, originalRequest)

    // Restore content after 10-14 business days (DMCA requirement)
    await this.scheduleContentRestoration(counterNotice, originalRequest)

    counterNotice.status = 'approved'
    counterNotice.processing.resolution = 'Counter notice accepted - content will be restored'
  }

  /**
   * Validate DMCA request
   */
  private validateDMCARequest(request: DMCARequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Required fields
    if (!request.reporter.name) errors.push('Reporter name is required')
    if (!request.reporter.email) errors.push('Reporter email is required')
    if (!request.reporter.address) errors.push('Reporter address is required')
    if (!request.content.id) errors.push('Content ID is required')
    if (!request.copyright.workTitle) errors.push('Copyright work title is required')
    if (!request.copyright.copyrightOwner) errors.push('Copyright owner is required')

    // Legal statements
    if (!request.legal.goodFaithBelief) errors.push('Good faith belief statement is required')
    if (!request.legal.accuracyStatement) errors.push('Accuracy statement is required')
    if (!request.legal.perjuryStatement) errors.push('Perjury statement is required')
    if (!request.legal.authorizationStatement) errors.push('Authorization statement is required')

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(request.reporter.email)) {
      errors.push('Invalid email format')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate counter notice
   */
  private validateCounterNotice(counterNotice: DMCARequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!counterNotice.reporter.name) errors.push('Name is required')
    if (!counterNotice.reporter.email) errors.push('Email is required')
    if (!counterNotice.reporter.address) errors.push('Address is required')
    if (!counterNotice.legal.goodFaithBelief) errors.push('Good faith belief statement is required')
    if (!counterNotice.legal.accuracyStatement) errors.push('Accuracy statement is required')
    if (!counterNotice.legal.perjuryStatement) errors.push('Perjury statement is required')
    if (!counterNotice.legal.contactConsent) errors.push('Consent to jurisdiction is required')

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Verify content exists
   */
  private async verifyContentExists(contentId: string): Promise<boolean> {
    // In production, check against your content database
    return true // Simplified for demo
  }

  /**
   * Verify reporter information
   */
  private async verifyReporterInformation(reporter: any): Promise<boolean> {
    // In production, verify reporter information
    return true // Simplified for demo
  }

  /**
   * Detect false claims
   */
  private async detectFalseClaim(request: DMCARequest): Promise<boolean> {
    // In production, implement false claim detection
    return false // Simplified for demo
  }

  /**
   * Check if it's a clear infringement
   */
  private isClearInfringement(request: DMCARequest): boolean {
    // In production, implement clear infringement detection
    return false // Simplified for demo
  }

  /**
   * Remove content from platform
   */
  private async removeContent(contentId: string): Promise<void> {
    // In production, remove content from database and CDN
    console.log(`Removing content: ${contentId}`)
  }

  /**
   * Notify content creator
   */
  private async notifyContentCreator(request: DMCARequest): Promise<void> {
    // In production, send notification to content creator
    console.log(`Notifying content creator: ${request.content.creatorId}`)
  }

  /**
   * Notify original reporter
   */
  private async notifyOriginalReporter(counterNotice: DMCARequest, originalRequest: DMCARequest): Promise<void> {
    // In production, send notification to original reporter
    console.log(`Notifying original reporter: ${originalRequest.reporter.email}`)
  }

  /**
   * Schedule content restoration
   */
  private async scheduleContentRestoration(counterNotice: DMCARequest, originalRequest: DMCARequest): Promise<void> {
    // In production, schedule content restoration after 10-14 business days
    console.log('Scheduling content restoration')
  }

  /**
   * Schedule legal review
   */
  private async scheduleLegalReview(request: DMCARequest): Promise<void> {
    // In production, schedule with legal team
    console.log('Scheduling legal review')
  }

  /**
   * Process request decision
   */
  private async processRequestDecision(request: DMCARequest): Promise<void> {
    // In production, implement decision logic
    console.log('Processing request decision')
  }

  /**
   * Suspend user
   */
  private async suspendUser(userId: string, reason: string): Promise<void> {
    // In production, suspend user account
    console.log(`Suspending user ${userId}: ${reason}`)
  }

  /**
   * Notify DMCA request
   */
  private async notifyDMCARequest(request: DMCARequest): Promise<void> {
    // In production, send notifications to relevant parties
    console.log('Sending DMCA notifications')
  }

  /**
   * Log DMCA action
   */
  private logDMCAAction(request: DMCARequest, action: string): void {
    console.log('DMCA Action:', {
      requestId: request.id,
      action,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `DMCA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate content hash
   */
  private async generateContentHash(contentId: string): Promise<string> {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(contentId).digest('hex')
  }

  /**
   * Get DMCA statistics
   */
  getDMCAStats(): any {
    const requests = Array.from(this.dmcaRequests.values())
    
    return {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      approvedRequests: requests.filter(r => r.status === 'approved').length,
      rejectedRequests: requests.filter(r => r.status === 'rejected').length,
      resolvedRequests: requests.filter(r => r.status === 'resolved').length,
      repeatInfringers: this.repeatInfringers.size,
      averageResponseTime: this.calculateAverageResponseTime(requests)
    }
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(requests: DMCARequest[]): number {
    const resolvedRequests = requests.filter(r => r.processing.resolvedAt)
    if (resolvedRequests.length === 0) return 0
    
    const totalTime = resolvedRequests.reduce((sum, request) => {
      const submitted = new Date(request.processing.submittedAt)
      const resolved = new Date(request.processing.resolvedAt!)
      return sum + (resolved.getTime() - submitted.getTime())
    }, 0)
    
    return totalTime / resolvedRequests.length / (1000 * 60 * 60) // Hours
  }
}
