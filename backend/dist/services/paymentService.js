"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
class PaymentService {
    constructor(provider = 'commercegate') {
        this.provider = 'commercegate';
        this.provider = provider;
    }
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
        ];
    }
    getRecommendedGateway() {
        return 'commercegate';
    }
    validateCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cleaned))
            return false;
        let sum = 0;
        let isEven = false;
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned[i]);
            if (isEven) {
                digit *= 2;
                if (digit > 9)
                    digit -= 9;
            }
            sum += digit;
            isEven = !isEven;
        }
        return sum % 10 === 0;
    }
    detectCardType(cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        if (/^4/.test(cleaned))
            return 'visa';
        if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned))
            return 'mastercard';
        if (/^3[47]/.test(cleaned))
            return 'amex';
        if (/^6/.test(cleaned))
            return 'discover';
        if (/^35/.test(cleaned))
            return 'jcb';
        if (/^3[068]/.test(cleaned))
            return 'diners';
        return 'unknown';
    }
    validateCVV(cvv, cardType) {
        const cleaned = cvv.replace(/\s/g, '');
        if (cardType === 'amex') {
            return /^\d{4}$/.test(cleaned);
        }
        return /^\d{3}$/.test(cleaned);
    }
    validateExpiryDate(month, year) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const expiryYear = parseInt(year);
        const expiryMonth = parseInt(month);
        if (expiryYear < currentYear)
            return false;
        if (expiryYear === currentYear && expiryMonth < currentMonth)
            return false;
        if (expiryMonth < 1 || expiryMonth > 12)
            return false;
        return true;
    }
    async createPaymentMethod(data) {
        const cardType = this.detectCardType(data.cardNumber);
        const { data: paymentMethod, error } = await supabase_1.supabase
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
            .single();
        if (error) {
            logger_1.logger.error('Create payment method error:', error);
            throw new Error('Failed to create payment method');
        }
        return paymentMethod;
    }
    async getPaymentMethods(userId) {
        const { data: paymentMethods, error } = await supabase_1.supabase
            .from('payment_methods')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });
        if (error) {
            logger_1.logger.error('Get payment methods error:', error);
            throw new Error('Failed to fetch payment methods');
        }
        return paymentMethods || [];
    }
    async getPaymentMethod(id, userId) {
        const { data: paymentMethod, error } = await supabase_1.supabase
            .from('payment_methods')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
        if (error) {
            logger_1.logger.error('Get payment method error:', error);
            return null;
        }
        return paymentMethod;
    }
    async updatePaymentMethod(id, updateData) {
        const { data: paymentMethod, error } = await supabase_1.supabase
            .from('payment_methods')
            .update({
            cardholder_name: updateData.cardholderName,
            billing_address: updateData.billingAddress,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            logger_1.logger.error('Update payment method error:', error);
            throw new Error('Failed to update payment method');
        }
        return paymentMethod;
    }
    async deletePaymentMethod(id) {
        const { error } = await supabase_1.supabase
            .from('payment_methods')
            .delete()
            .eq('id', id);
        if (error) {
            logger_1.logger.error('Delete payment method error:', error);
            throw new Error('Failed to delete payment method');
        }
    }
    async setDefaultPaymentMethod(id, userId) {
        await supabase_1.supabase
            .from('payment_methods')
            .update({ is_default: false })
            .eq('user_id', userId);
        const { error } = await supabase_1.supabase
            .from('payment_methods')
            .update({ is_default: true })
            .eq('id', id)
            .eq('user_id', userId);
        if (error) {
            logger_1.logger.error('Set default payment method error:', error);
            throw new Error('Failed to set default payment method');
        }
    }
    async createSubscriptionPayment(data) {
        const { data: plan } = await supabase_1.supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', data.planId)
            .single();
        if (!plan) {
            throw new Error('Subscription plan not found');
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
        };
        return paymentIntent;
    }
    async createTipPayment(data) {
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
        };
        return paymentIntent;
    }
    async createPPVPayment(data) {
        const { data: post } = await supabase_1.supabase
            .from('posts')
            .select('price, creator_id')
            .eq('id', data.postId)
            .single();
        if (!post) {
            throw new Error('Post not found');
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
        };
        return paymentIntent;
    }
    async confirmPaymentIntent(intentId, userId) {
        const result = {
            id: intentId,
            status: 'succeeded',
            amount: 0,
            currency: 'USD',
            payment_method: 'card',
            created: new Date().toISOString()
        };
        return result;
    }
    async getTransactionHistory(params) {
        let query = supabase_1.supabase
            .from('transactions')
            .select('*')
            .eq('user_id', params.userId)
            .order('created_at', { ascending: false });
        if (params.type) {
            query = query.eq('type', params.type);
        }
        const { data: transactions, error } = await query
            .range((params.page - 1) * params.limit, params.page * params.limit - 1);
        if (error) {
            logger_1.logger.error('Get transaction history error:', error);
            throw new Error('Failed to fetch transaction history');
        }
        return transactions || [];
    }
    calculateFees(amount, provider = this.provider) {
        const gateways = this.getAvailableGateways();
        const gateway = gateways.find(g => g.id === provider) || gateways[0];
        const feeString = gateway.fees;
        const percentageMatch = feeString.match(/(\d+\.?\d*)%/);
        const fixedMatch = feeString.match(/(\d+\.?\d*)[¢$]/);
        const percentage = percentageMatch ? parseFloat(percentageMatch[1]) : 0;
        const fixed = fixedMatch ? parseFloat(fixedMatch[1]) : 0;
        return (amount * percentage / 100) + fixed;
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=paymentService.js.map