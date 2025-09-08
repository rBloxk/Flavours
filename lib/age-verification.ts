/**
 * Age Verification System
 * Comprehensive age verification for adult content platform
 */

export interface AgeVerificationConfig {
  enableIDVerification: boolean
  enableCreditCardVerification: boolean
  enableGovernmentIDVerification: boolean
  enableManualReview: boolean
  requirePhotoVerification: boolean
  enableBiometricVerification: boolean
  enableBlockchainVerification: boolean
  verificationExpirationDays: number
  requireReVerification: boolean
  enableGeoblocking: boolean
  blockedCountries: string[]
  allowedCountries: string[]
}

export interface AgeVerificationRequest {
  id: string
  userId: string
  method: 'id_scan' | 'credit_card' | 'government_id' | 'manual_review' | 'biometric' | 'blockchain'
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'expired'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // User information
  user: {
    name: string
    email: string
    phone?: string
    address: string
    country: string
    dateOfBirth: string
  }
  
  // Verification data
  verification: {
    idNumber?: string
    idType?: string
    idImage?: string
    selfieImage?: string
    creditCardLast4?: string
    governmentIdNumber?: string
    biometricData?: string
    blockchainHash?: string
  }
  
  // Processing information
  processing: {
    submittedAt: string
    processedAt?: string
    reviewedAt?: string
    reviewedBy?: string
    expiresAt: string
    notes?: string
  }
  
  // Results
  results: {
    isVerified: boolean
    age: number
    confidence: number
    verificationScore: number
    riskScore: number
    flags: string[]
    evidence: string[]
  }
}

export interface AgeVerificationResult {
  isVerified: boolean
  age: number
  method: string
  confidence: number
  timestamp: string
  expiresAt: string
  verificationId: string
  riskFlags: string[]
}

export class AgeVerificationService {
  private static instance: AgeVerificationService
  private config: AgeVerificationConfig
  private verificationRequests: Map<string, AgeVerificationRequest> = new Map()
  private verifiedUsers: Map<string, AgeVerificationResult> = new Map()
  private blockedUsers: Map<string, string> = new Map() // userId -> reason

  constructor(config: AgeVerificationConfig) {
    this.config = config
  }

  static getInstance(config?: AgeVerificationConfig): AgeVerificationService {
    if (!AgeVerificationService.instance) {
      AgeVerificationService.instance = new AgeVerificationService(
        config || {
          enableIDVerification: true,
          enableCreditCardVerification: true,
          enableGovernmentIDVerification: true,
          enableManualReview: true,
          requirePhotoVerification: true,
          enableBiometricVerification: false,
          enableBlockchainVerification: false,
          verificationExpirationDays: 365,
          requireReVerification: true,
          enableGeoblocking: true,
          blockedCountries: ['CN', 'IR', 'KP'],
          allowedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE']
        }
      )
    }
    return AgeVerificationService.instance
  }

  /**
   * Submit age verification request
   */
  async submitVerificationRequest(
    userId: string,
    verificationData: {
      method: AgeVerificationRequest['method']
      user: AgeVerificationRequest['user']
      verification: AgeVerificationRequest['verification']
    }
  ): Promise<AgeVerificationRequest> {
    // Check if user is already verified
    const existingVerification = this.verifiedUsers.get(userId)
    if (existingVerification && new Date(existingVerification.expiresAt) > new Date()) {
      throw new Error('User is already verified')
    }

    // Check if user is blocked
    if (this.blockedUsers.has(userId)) {
      throw new Error(`User is blocked: ${this.blockedUsers.get(userId)}`)
    }

    // Check geoblocking
    if (this.config.enableGeoblocking) {
      const isBlocked = this.config.blockedCountries.includes(verificationData.user.country)
      const isAllowed = this.config.allowedCountries.includes(verificationData.user.country)
      
      if (isBlocked) {
        throw new Error('Age verification not available in your country')
      }
      
      if (this.config.allowedCountries.length > 0 && !isAllowed) {
        throw new Error('Age verification not available in your country')
      }
    }

    const request: AgeVerificationRequest = {
      id: this.generateVerificationId(),
      userId,
      method: verificationData.method,
      status: 'pending',
      priority: this.determinePriority(verificationData),
      user: verificationData.user,
      verification: verificationData.verification,
      processing: {
        submittedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.config.verificationExpirationDays * 24 * 60 * 60 * 1000).toISOString()
      },
      results: {
        isVerified: false,
        age: 0,
        confidence: 0,
        verificationScore: 0,
        riskScore: 0,
        flags: [],
        evidence: []
      }
    }

    // Validate request
    const validation = this.validateVerificationRequest(request)
    if (!validation.isValid) {
      throw new Error(`Invalid verification request: ${validation.errors.join(', ')}`)
    }

    // Store the request
    this.verificationRequests.set(request.id, request)

    // Process the verification
    await this.processVerification(request)

    return request
  }

  /**
   * Process age verification
   */
  private async processVerification(request: AgeVerificationRequest): Promise<void> {
    try {
      request.status = 'processing'

      // Perform verification based on method
      let result: AgeVerificationResult

      switch (request.method) {
        case 'id_scan':
          result = await this.performIDVerification(request)
          break
        case 'credit_card':
          result = await this.performCreditCardVerification(request)
          break
        case 'government_id':
          result = await this.performGovernmentIDVerification(request)
          break
        case 'biometric':
          result = await this.performBiometricVerification(request)
          break
        case 'blockchain':
          result = await this.performBlockchainVerification(request)
          break
        case 'manual_review':
          result = await this.performManualReview(request)
          break
        default:
          throw new Error('Invalid verification method')
      }

      // Update request with results
      request.results = {
        isVerified: result.isVerified,
        age: result.age,
        confidence: result.confidence,
        verificationScore: result.confidence,
        riskScore: this.calculateRiskScore(request),
        flags: result.riskFlags,
        evidence: ['verification_completed']
      }

      request.status = result.isVerified ? 'approved' : 'rejected'
      request.processing.processedAt = new Date().toISOString()

      // Store verification result
      if (result.isVerified) {
        this.verifiedUsers.set(request.userId, result)
      }

      // Log the verification
      this.logVerification(request, result)

    } catch (error) {
      console.error('Verification processing error:', error)
      request.status = 'rejected'
      request.processing.notes = `Processing error: ${error}`
    }
  }

  /**
   * Perform ID verification
   */
  private async performIDVerification(request: AgeVerificationRequest): Promise<AgeVerificationResult> {
    // In production, integrate with ID verification services like:
    // - Jumio
    // - Onfido
    // - ID.me
    // - Custom OCR + validation

    const age = this.calculateAge(request.user.dateOfBirth)
    const isVerified = age >= 18 && this.validateIDFormat(request.verification)

    // Simulate ID validation
    const confidence = isVerified ? 0.95 : 0.1
    const riskFlags: string[] = []

    if (age < 18) {
      riskFlags.push('underage')
    }

    if (!this.validateIDFormat(request.verification)) {
      riskFlags.push('invalid_id_format')
    }

    return {
      isVerified,
      age,
      method: 'id_scan',
      confidence,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.config.verificationExpirationDays * 24 * 60 * 60 * 1000).toISOString(),
      verificationId: request.id,
      riskFlags
    }
  }

  /**
   * Perform credit card verification
   */
  private async performCreditCardVerification(request: AgeVerificationRequest): Promise<AgeVerificationResult> {
    // In production, integrate with payment processors to verify age
    // Credit card verification is less reliable but can be used as secondary verification

    const age = this.calculateAge(request.user.dateOfBirth)
    const isVerified = age >= 18

    const confidence = isVerified ? 0.7 : 0.1
    const riskFlags: string[] = []

    if (age < 18) {
      riskFlags.push('underage')
    }

    return {
      isVerified,
      age,
      method: 'credit_card',
      confidence,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      verificationId: request.id,
      riskFlags
    }
  }

  /**
   * Perform government ID verification
   */
  private async performGovernmentIDVerification(request: AgeVerificationRequest): Promise<AgeVerificationResult> {
    // In production, integrate with government ID verification services

    const age = this.calculateAge(request.user.dateOfBirth)
    const isVerified = age >= 18 && this.validateGovernmentID(request.verification)

    const confidence = isVerified ? 0.98 : 0.1
    const riskFlags: string[] = []

    if (age < 18) {
      riskFlags.push('underage')
    }

    if (!this.validateGovernmentID(request.verification)) {
      riskFlags.push('invalid_government_id')
    }

    return {
      isVerified,
      age,
      method: 'government_id',
      confidence,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.config.verificationExpirationDays * 24 * 60 * 60 * 1000).toISOString(),
      verificationId: request.id,
      riskFlags
    }
  }

  /**
   * Perform biometric verification
   */
  private async performBiometricVerification(request: AgeVerificationRequest): Promise<AgeVerificationResult> {
    // In production, integrate with biometric verification services

    const age = this.calculateAge(request.user.dateOfBirth)
    const isVerified = age >= 18 && this.validateBiometricData(request.verification)

    const confidence = isVerified ? 0.99 : 0.1
    const riskFlags: string[] = []

    if (age < 18) {
      riskFlags.push('underage')
    }

    return {
      isVerified,
      age,
      method: 'biometric',
      confidence,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.config.verificationExpirationDays * 24 * 60 * 60 * 1000).toISOString(),
      verificationId: request.id,
      riskFlags
    }
  }

  /**
   * Perform blockchain verification
   */
  private async performBlockchainVerification(request: AgeVerificationRequest): Promise<AgeVerificationResult> {
    // In production, integrate with blockchain-based identity verification

    const age = this.calculateAge(request.user.dateOfBirth)
    const isVerified = age >= 18 && this.validateBlockchainHash(request.verification)

    const confidence = isVerified ? 0.97 : 0.1
    const riskFlags: string[] = []

    if (age < 18) {
      riskFlags.push('underage')
    }

    return {
      isVerified,
      age,
      method: 'blockchain',
      confidence,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.config.verificationExpirationDays * 24 * 60 * 60 * 1000).toISOString(),
      verificationId: request.id,
      riskFlags
    }
  }

  /**
   * Perform manual review
   */
  private async performManualReview(request: AgeVerificationRequest): Promise<AgeVerificationResult> {
    // In production, assign to human reviewers

    const age = this.calculateAge(request.user.dateOfBirth)
    const isVerified = age >= 18

    const confidence = isVerified ? 0.85 : 0.1
    const riskFlags: string[] = []

    if (age < 18) {
      riskFlags.push('underage')
    }

    return {
      isVerified,
      age,
      method: 'manual_review',
      confidence,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.config.verificationExpirationDays * 24 * 60 * 60 * 1000).toISOString(),
      verificationId: request.id,
      riskFlags
    }
  }

  /**
   * Calculate age from birth date
   */
  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  /**
   * Validate ID format
   */
  private validateIDFormat(verification: any): boolean {
    // In production, implement proper ID validation
    return verification.idNumber && verification.idNumber.length > 5
  }

  /**
   * Validate government ID
   */
  private validateGovernmentID(verification: any): boolean {
    // In production, implement government ID validation
    return verification.governmentIdNumber && verification.governmentIdNumber.length > 5
  }

  /**
   * Validate biometric data
   */
  private validateBiometricData(verification: any): boolean {
    // In production, implement biometric validation
    return verification.biometricData && verification.biometricData.length > 10
  }

  /**
   * Validate blockchain hash
   */
  private validateBlockchainHash(verification: any): boolean {
    // In production, implement blockchain validation
    return verification.blockchainHash && verification.blockchainHash.length > 20
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(request: AgeVerificationRequest): number {
    let riskScore = 0

    // Age risk
    if (request.results.age < 18) {
      riskScore += 100
    } else if (request.results.age < 21) {
      riskScore += 20
    }

    // Method risk
    switch (request.method) {
      case 'id_scan':
        riskScore += 5
        break
      case 'credit_card':
        riskScore += 15
        break
      case 'government_id':
        riskScore += 2
        break
      case 'biometric':
        riskScore += 1
        break
      case 'blockchain':
        riskScore += 3
        break
      case 'manual_review':
        riskScore += 10
        break
    }

    // Country risk
    if (this.config.blockedCountries.includes(request.user.country)) {
      riskScore += 50
    }

    return Math.min(riskScore, 100)
  }

  /**
   * Determine priority
   */
  private determinePriority(verificationData: any): 'low' | 'medium' | 'high' | 'urgent' {
    const age = this.calculateAge(verificationData.user.dateOfBirth)
    
    if (age < 18) {
      return 'urgent'
    }
    if (age < 21) {
      return 'high'
    }
    if (verificationData.method === 'manual_review') {
      return 'medium'
    }
    return 'low'
  }

  /**
   * Validate verification request
   */
  private validateVerificationRequest(request: AgeVerificationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!request.user.name) errors.push('Name is required')
    if (!request.user.email) errors.push('Email is required')
    if (!request.user.address) errors.push('Address is required')
    if (!request.user.country) errors.push('Country is required')
    if (!request.user.dateOfBirth) errors.push('Date of birth is required')

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(request.user.email)) {
      errors.push('Invalid email format')
    }

    // Date validation
    const birthDate = new Date(request.user.dateOfBirth)
    if (isNaN(birthDate.getTime())) {
      errors.push('Invalid date of birth')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Log verification
   */
  private logVerification(request: AgeVerificationRequest, result: AgeVerificationResult): void {
    console.log('Age Verification:', {
      requestId: request.id,
      userId: request.userId,
      method: request.method,
      result,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Generate verification ID
   */
  private generateVerificationId(): string {
    return `VERIFY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Check if user is verified
   */
  isUserVerified(userId: string): boolean {
    const verification = this.verifiedUsers.get(userId)
    if (!verification) return false
    
    return new Date(verification.expiresAt) > new Date()
  }

  /**
   * Get user verification status
   */
  getUserVerificationStatus(userId: string): AgeVerificationResult | null {
    const verification = this.verifiedUsers.get(userId)
    if (!verification) return null
    
    if (new Date(verification.expiresAt) <= new Date()) {
      return null
    }
    
    return verification
  }

  /**
   * Block user
   */
  blockUser(userId: string, reason: string): void {
    this.blockedUsers.set(userId, reason)
    this.verifiedUsers.delete(userId)
  }

  /**
   * Unblock user
   */
  unblockUser(userId: string): void {
    this.blockedUsers.delete(userId)
  }

  /**
   * Get verification statistics
   */
  getVerificationStats(): any {
    const requests = Array.from(this.verificationRequests.values())
    const verified = Array.from(this.verifiedUsers.values())
    
    return {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      approvedRequests: requests.filter(r => r.status === 'approved').length,
      rejectedRequests: requests.filter(r => r.status === 'rejected').length,
      verifiedUsers: verified.length,
      blockedUsers: this.blockedUsers.size,
      requestsByMethod: this.groupRequestsByMethod(requests),
      averageProcessingTime: this.calculateAverageProcessingTime(requests)
    }
  }

  /**
   * Group requests by method
   */
  private groupRequestsByMethod(requests: AgeVerificationRequest[]): Record<string, number> {
    return requests.reduce((acc, request) => {
      acc[request.method] = (acc[request.method] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Calculate average processing time
   */
  private calculateAverageProcessingTime(requests: AgeVerificationRequest[]): number {
    const processedRequests = requests.filter(r => r.processing.processedAt)
    if (processedRequests.length === 0) return 0
    
    const totalTime = processedRequests.reduce((sum, request) => {
      const submitted = new Date(request.processing.submittedAt)
      const processed = new Date(request.processing.processedAt!)
      return sum + (processed.getTime() - submitted.getTime())
    }, 0)
    
    return totalTime / processedRequests.length / (1000 * 60) // Minutes
  }
}
