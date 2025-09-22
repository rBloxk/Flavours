export interface PaymentMethodData {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName: string;
    billingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    userId: string;
}
export interface PaymentIntentData {
    userId: string;
    creatorId?: string;
    planId?: string;
    postId?: string;
    amount?: number;
    message?: string;
    paymentMethodId?: string;
}
export interface TransactionHistoryParams {
    userId: string;
    page: number;
    limit: number;
    type?: string;
}
export declare class PaymentService {
    private provider;
    constructor(provider?: string);
    getAvailableGateways(): {
        id: string;
        name: string;
        supported: boolean;
        adultFriendly: boolean;
        fees: string;
        description: string;
    }[];
    getRecommendedGateway(): string;
    validateCardNumber(cardNumber: string): boolean;
    detectCardType(cardNumber: string): string;
    validateCVV(cvv: string, cardType: string): boolean;
    validateExpiryDate(month: string, year: string): boolean;
    createPaymentMethod(data: PaymentMethodData): Promise<any>;
    getPaymentMethods(userId: string): Promise<any[]>;
    getPaymentMethod(id: string, userId: string): Promise<any>;
    updatePaymentMethod(id: string, updateData: any): Promise<any>;
    deletePaymentMethod(id: string): Promise<void>;
    setDefaultPaymentMethod(id: string, userId: string): Promise<void>;
    createSubscriptionPayment(data: PaymentIntentData): Promise<{
        id: string;
        user_id: string;
        amount: any;
        currency: string;
        status: string;
        payment_method_id: string | undefined;
        client_secret: string;
        metadata: {
            type: string;
            creator_id: string | undefined;
            plan_id: string | undefined;
        };
        created_at: string;
    }>;
    createTipPayment(data: PaymentIntentData): Promise<{
        id: string;
        user_id: string;
        amount: number | undefined;
        currency: string;
        status: string;
        payment_method_id: string | undefined;
        client_secret: string;
        metadata: {
            type: string;
            creator_id: string | undefined;
            message: string | undefined;
        };
        created_at: string;
    }>;
    createPPVPayment(data: PaymentIntentData): Promise<{
        id: string;
        user_id: string;
        amount: any;
        currency: string;
        status: string;
        payment_method_id: string | undefined;
        client_secret: string;
        metadata: {
            type: string;
            post_id: string | undefined;
            creator_id: any;
        };
        created_at: string;
    }>;
    confirmPaymentIntent(intentId: string, userId: string): Promise<{
        id: string;
        status: string;
        amount: number;
        currency: string;
        payment_method: string;
        created: string;
    }>;
    getTransactionHistory(params: TransactionHistoryParams): Promise<any[]>;
    calculateFees(amount: number, provider?: string): number;
}
//# sourceMappingURL=paymentService.d.ts.map