export interface VerificationToken {
    token: string;
    userId: string;
    email: string;
    type: 'email_verification' | 'password_reset';
    expiresAt: Date;
    createdAt: Date;
}
declare class VerificationService {
    private readonly TOKEN_EXPIRY_HOURS;
    generateVerificationToken(userId: string, email: string, type?: 'email_verification' | 'password_reset'): Promise<string>;
    validateVerificationToken(token: string, type?: 'email_verification' | 'password_reset'): Promise<{
        valid: boolean;
        userId?: string;
        email?: string;
        error?: string;
    }>;
    markTokenAsUsed(token: string): Promise<void>;
    cleanupExpiredTokens(): Promise<void>;
    generateVerificationUrl(token: string, type?: 'email_verification' | 'password_reset'): string;
    getUserByEmail(email: string): Promise<{
        userId?: string;
        username?: string;
    } | null>;
    getUserByUserId(userId: string): Promise<{
        email?: string;
        username?: string;
        displayName?: string;
    } | null>;
}
export declare const verificationService: VerificationService;
export {};
//# sourceMappingURL=verificationService.d.ts.map