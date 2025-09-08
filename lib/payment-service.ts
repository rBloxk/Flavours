import { PaymentMethod, PaymentIntent, BillingAddress } from './types'

// Payment gateway configurations for adult-friendly processors
const PAYMENT_GATEWAYS = {
  stripe: {
    name: 'Stripe',
    supported: true,
    adultFriendly: false, // Stripe doesn't explicitly support adult content
    fees: '2.9% + 30¢',
    description: 'General purpose payment processor'
  },
  commercegate: {
    name: 'CommerceGate',
    supported: true,
    adultFriendly: true,
    fees: '3.5% + 35¢',
    description: 'Specialized in high-risk industries including adult entertainment'
  },
  ccbill: {
    name: 'CCBill',
    supported: true,
    adultFriendly: true,
    fees: '3.5% + 35¢',
    description: 'Leading payment processor for adult and subscription-based businesses'
  },
  segpay: {
    name: 'Segpay',
    supported: true,
    adultFriendly: true,
    fees: '3.5% + 35¢',
    description: 'Adult-friendly payment processor with strong chargeback management'
  }
} as const

export type PaymentProvider = keyof typeof PAYMENT_GATEWAYS

export class PaymentService {
  private provider: PaymentProvider = 'commercegate' // Default to adult-friendly provider

  constructor(provider: PaymentProvider = 'commercegate') {
    this.provider = provider
  }

  /**
   * Get available payment gateways suitable for adult content
   */
  getAvailableGateways() {
    return Object.entries(PAYMENT_GATEWAYS)
      .filter(([_, config]) => config.supported)
      .map(([key, config]) => ({
        id: key as PaymentProvider,
        ...config
      }))
  }

  /**
   * Get recommended payment gateway for adult content
   */
  getRecommendedGateway(): PaymentProvider {
    // Return the first adult-friendly gateway
    const adultFriendly = Object.entries(PAYMENT_GATEWAYS)
      .find(([_, config]) => config.adultFriendly)
    
    return (adultFriendly?.[0] as PaymentProvider) || 'commercegate'
  }

  /**
   * Validate credit card number using Luhn algorithm
   */
  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '')
    if (!/^\d{13,19}$/.test(cleaned)) return false

    let sum = 0
    let isEven = false

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  /**
   * Detect card type from card number
   */
  detectCardType(cardNumber: string): PaymentMethod['type'] | 'unknown' {
    const cleaned = cardNumber.replace(/\s/g, '')
    
    if (/^4/.test(cleaned)) return 'visa'
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard'
    if (/^3[47]/.test(cleaned)) return 'amex'
    if (/^6/.test(cleaned)) return 'discover'
    if (/^35/.test(cleaned)) return 'jcb'
    if (/^3[068]/.test(cleaned)) return 'diners'
    
    return 'unknown'
  }

  /**
   * Validate CVV based on card type
   */
  validateCVV(cvv: string, cardType: PaymentMethod['type']): boolean {
    const cleaned = cvv.replace(/\s/g, '')
    
    if (cardType === 'amex') {
      return /^\d{4}$/.test(cleaned)
    }
    
    return /^\d{3}$/.test(cleaned)
  }

  /**
   * Validate expiry date
   */
  validateExpiryDate(month: string, year: string): boolean {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    const expiryYear = parseInt(year)
    const expiryMonth = parseInt(month)
    
    if (expiryYear < currentYear) return false
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false
    if (expiryMonth < 1 || expiryMonth > 12) return false
    
    return true
  }

  /**
   * Format card number for display
   */
  formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '')
    const matches = cleaned.match(/\d{4,16}/g)
    const match = matches?.[0] || ''
    const parts = []
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    return parts.join(' ')
  }

  /**
   * Mask card number for security
   */
  maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '')
    if (cleaned.length < 8) return '•••• •••• •••• ••••'
    
    const last4 = cleaned.slice(-4)
    const masked = '•'.repeat(cleaned.length - 4)
    const formatted = this.formatCardNumber(masked + last4)
    
    return formatted
  }

  /**
   * Create payment method (simulated)
   */
  async createPaymentMethod(data: {
    cardNumber: string
    expiryMonth: string
    expiryYear: string
    cvv: string
    cardholderName: string
    billingAddress: BillingAddress
  }): Promise<PaymentMethod> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const cardType = this.detectCardType(data.cardNumber)
    if (cardType === 'unknown') {
      throw new Error('Invalid card type')
    }

    if (!this.validateCardNumber(data.cardNumber)) {
      throw new Error('Invalid card number')
    }

    if (!this.validateCVV(data.cvv, cardType)) {
      throw new Error('Invalid CVV')
    }

    if (!this.validateExpiryDate(data.expiryMonth, data.expiryYear)) {
      throw new Error('Card has expired')
    }

    // Simulate successful payment method creation
    const paymentMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      user_id: 'current_user', // This would come from auth context
      type: cardType,
      last4: data.cardNumber.slice(-4),
      expiry_month: data.expiryMonth,
      expiry_year: data.expiryYear,
      cardholder_name: data.cardholderName,
      billing_address: data.billingAddress,
      is_default: false,
      is_verified: true,
      payment_provider: this.provider,
      payment_provider_id: `pm_${this.provider}_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return paymentMethod
  }

  /**
   * Get user's payment methods
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Return mock data - in real implementation, this would fetch from database
    return []
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In real implementation, this would delete from database and payment provider
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In real implementation, this would update the database
  }

  /**
   * Create payment intent for subscription or purchase
   */
  async createPaymentIntent(data: {
    amount: number
    currency: string
    paymentMethodId?: string
    metadata?: Record<string, any>
  }): Promise<PaymentIntent> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}`,
      user_id: 'current_user',
      amount: data.amount,
      currency: data.currency,
      status: 'requires_confirmation',
      payment_method_id: data.paymentMethodId,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      metadata: data.metadata || {},
      created_at: new Date().toISOString()
    }

    return paymentIntent
  }

  /**
   * Get payment gateway fees for a given amount
   */
  calculateFees(amount: number, provider: PaymentProvider = this.provider): number {
    const gateway = PAYMENT_GATEWAYS[provider]
    const feeString = gateway.fees
    
    // Parse fee string (e.g., "3.5% + 35¢")
    const percentageMatch = feeString.match(/(\d+\.?\d*)%/)
    const fixedMatch = feeString.match(/(\d+\.?\d*)[¢$]/)
    
    const percentage = percentageMatch ? parseFloat(percentageMatch[1]) : 0
    const fixed = fixedMatch ? parseFloat(fixedMatch[1]) : 0
    
    return (amount * percentage / 100) + fixed
  }
}

// Export singleton instance
export const paymentService = new PaymentService()
