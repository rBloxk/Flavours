import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'

export interface PaymentMethodData {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
  billingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  userId: string
}

export interface PaymentIntentData {
  userId: string
  creatorId?: string
  planId?: string
  postId?: string
  amount?: number
  message?: string
  paymentMethodId?: string
}

export interface TransactionHistoryParams {
  userId: string
  page: number
  limit: number
  type?: string
}

export class PaymentService {
  private provider: string = 'commercegate' // Default to adult-friendly provider

  constructor(provider: string = 'commercegate') {
    this.provider = provider
  }

  /**
   * Get available payment gateways suitable for adult content
   */
  getAvailableGateways() {
    return [
      {
        id: 'commercegate',
        name: 'CommerceGate',
        supported: true,
        adultFriendly: true,
        fees: '3.5% + 35¢',
        description: 'Specialized in high-risk industries including adult entertainment'
      },
      {
        id: 'ccbill',
        name: 'CCBill',
        supported: true,
        adultFriendly: true,
        fees: '3.5% + 35¢',
        description: 'Leading payment processor for adult and subscription-based businesses'
      },
      {
        id: 'segpay',
        name: 'Segpay',
        supported: true,
        adultFriendly: true,
        fees: '3.5% + 35¢',
        description: 'Adult-friendly payment processor with strong chargeback management'
      },
      {
        id: 'stripe',
        name: 'Stripe',
        supported: true,
        adultFriendly: false,
        fees: '2.9% + 30¢',
        description: 'General purpose payment processor'
      }
    ]
  }

  /**
   * Get recommended payment gateway for adult content
   */
  getRecommendedGateway(): string {
    return 'commercegate'
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
  detectCardType(cardNumber: string): string {
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
  validateCVV(cvv: string, cardType: string): boolean {
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
   * Create payment method
   */
  async createPaymentMethod(data: PaymentMethodData) {
    const cardType = this.detectCardType(data.cardNumber)
    
    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: data.userId,
        type: cardType,
        last4: data.cardNumber.slice(-4),
        expiry_month: data.expiryMonth,
        expiry_year: data.expiryYear,
        cardholder_name: data.cardholderName,
        billing_address: data.billingAddress,
        is_default: false,
        is_verified: true,
        payment_provider: this.provider,
        payment_provider_id: `pm_${this.provider}_${Date.now()}`
      })
      .select()
      .single()

    if (error) {
      logger.error('Create payment method error:', error)
      throw new Error('Failed to create payment method')
    }

    return paymentMethod
  }

  /**
   * Get user's payment methods
   */
  async getPaymentMethods(userId: string) {
    const { data: paymentMethods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Get payment methods error:', error)
      throw new Error('Failed to fetch payment methods')
    }

    return paymentMethods || []
  }

  /**
   * Get specific payment method
   */
  async getPaymentMethod(id: string, userId: string) {
    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      logger.error('Get payment method error:', error)
      return null
    }

    return paymentMethod
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(id: string, updateData: any) {
    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .update({
        cardholder_name: updateData.cardholderName,
        billing_address: updateData.billingAddress,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Update payment method error:', error)
      throw new Error('Failed to update payment method')
    }

    return paymentMethod
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(id: string) {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Delete payment method error:', error)
      throw new Error('Failed to delete payment method')
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(id: string, userId: string) {
    // First, unset all default payment methods for this user
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId)

    // Then set the new default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      logger.error('Set default payment method error:', error)
      throw new Error('Failed to set default payment method')
    }
  }

  /**
   * Create subscription payment intent
   */
  async createSubscriptionPayment(data: PaymentIntentData) {
    // Get subscription plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', data.planId)
      .single()

    if (!plan) {
      throw new Error('Subscription plan not found')
    }

    const paymentIntent = {
      id: `pi_${Date.now()}`,
      user_id: data.userId,
      amount: plan.price,
      currency: 'USD',
      status: 'requires_confirmation',
      payment_method_id: data.paymentMethodId,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        type: 'subscription',
        creator_id: data.creatorId,
        plan_id: data.planId
      },
      created_at: new Date().toISOString()
    }

    return paymentIntent
  }

  /**
   * Create tip payment intent
   */
  async createTipPayment(data: PaymentIntentData) {
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      user_id: data.userId,
      amount: data.amount,
      currency: 'USD',
      status: 'requires_confirmation',
      payment_method_id: data.paymentMethodId,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        type: 'tip',
        creator_id: data.creatorId,
        message: data.message
      },
      created_at: new Date().toISOString()
    }

    return paymentIntent
  }

  /**
   * Create PPV payment intent
   */
  async createPPVPayment(data: PaymentIntentData) {
    // Get post details
    const { data: post } = await supabase
      .from('posts')
      .select('price, creator_id')
      .eq('id', data.postId)
      .single()

    if (!post) {
      throw new Error('Post not found')
    }

    const paymentIntent = {
      id: `pi_${Date.now()}`,
      user_id: data.userId,
      amount: post.price,
      currency: 'USD',
      status: 'requires_confirmation',
      payment_method_id: data.paymentMethodId,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        type: 'ppv',
        post_id: data.postId,
        creator_id: post.creator_id
      },
      created_at: new Date().toISOString()
    }

    return paymentIntent
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(intentId: string, userId: string) {
    // In a real implementation, this would integrate with the payment provider
    // For now, we'll simulate a successful payment
    
    const result = {
      id: intentId,
      status: 'succeeded',
      amount: 0, // Would be fetched from intent
      currency: 'USD',
      payment_method: 'card',
      created: new Date().toISOString()
    }

    return result
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(params: TransactionHistoryParams) {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false })

    if (params.type) {
      query = query.eq('type', params.type)
    }

    const { data: transactions, error } = await query
      .range(
        (params.page - 1) * params.limit,
        params.page * params.limit - 1
      )

    if (error) {
      logger.error('Get transaction history error:', error)
      throw new Error('Failed to fetch transaction history')
    }

    return transactions || []
  }

  /**
   * Calculate fees for a given amount
   */
  calculateFees(amount: number, provider: string = this.provider): number {
    const gateways = this.getAvailableGateways()
    const gateway = gateways.find(g => g.id === provider) || gateways[0]
    
    const feeString = gateway.fees
    
    // Parse fee string (e.g., "3.5% + 35¢")
    const percentageMatch = feeString.match(/(\d+\.?\d*)%/)
    const fixedMatch = feeString.match(/(\d+\.?\d*)[¢$]/)
    
    const percentage = percentageMatch ? parseFloat(percentageMatch[1]) : 0
    const fixed = fixedMatch ? parseFloat(fixedMatch[1]) : 0
    
    return (amount * percentage / 100) + fixed
  }
}
