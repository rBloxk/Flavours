export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export interface VerificationEmailData {
    email: string;
    username: string;
    verificationToken: string;
    verificationUrl: string;
}
export interface WelcomeEmailData {
    email: string;
    username: string;
    displayName: string;
}
declare class EmailService {
    private transporter;
    private isConfigured;
    constructor();
    private initializeTransporter;
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendVerificationEmail(data: VerificationEmailData): Promise<boolean>;
    sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean>;
    sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string): Promise<boolean>;
    private generateVerificationEmailHtml;
    private generateWelcomeEmailHtml;
    private generatePasswordResetEmailHtml;
    private stripHtml;
    isEmailConfigured(): boolean;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=emailService.d.ts.map