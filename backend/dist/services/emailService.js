"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer = __importStar(require("nodemailer"));
const environment_1 = require("../config/environment");
const logger_1 = require("../utils/logger");
class EmailService {
    constructor() {
        this.transporter = null;
        this.isConfigured = false;
        this.initializeTransporter();
    }
    initializeTransporter() {
        try {
            if (!environment_1.config.SMTP_HOST || !environment_1.config.SMTP_PORT || !environment_1.config.SMTP_USER || !environment_1.config.SMTP_PASS) {
                logger_1.logger.warn('Email service not configured. SMTP settings missing.');
                return;
            }
            this.transporter = nodemailer.createTransport({
                host: environment_1.config.SMTP_HOST,
                port: environment_1.config.SMTP_PORT,
                secure: environment_1.config.SMTP_PORT === 465,
                auth: {
                    user: environment_1.config.SMTP_USER,
                    pass: environment_1.config.SMTP_PASS,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            this.isConfigured = true;
            logger_1.logger.info('Email service initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize email service:', error);
            this.isConfigured = false;
        }
    }
    async sendEmail(options) {
        if (!this.isConfigured || !this.transporter) {
            logger_1.logger.warn('Email service not configured. Cannot send email.');
            return false;
        }
        try {
            const mailOptions = {
                from: '"Flavours" <noreply@flavours.club>',
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text || this.stripHtml(options.html)
            };
            const result = await this.transporter.sendMail(mailOptions);
            logger_1.logger.info(`Email sent successfully to ${options.to}:`, result.messageId);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Failed to send email:', error);
            return false;
        }
    }
    async sendVerificationEmail(data) {
        const html = this.generateVerificationEmailHtml(data);
        const subject = 'Verify your Flavours account';
        return this.sendEmail({
            to: data.email,
            subject,
            html
        });
    }
    async sendWelcomeEmail(data) {
        const html = this.generateWelcomeEmailHtml(data);
        const subject = 'Welcome to Flavours!';
        return this.sendEmail({
            to: data.email,
            subject,
            html
        });
    }
    async sendPasswordResetEmail(email, resetToken, resetUrl) {
        const html = this.generatePasswordResetEmailHtml(email, resetToken, resetUrl);
        const subject = 'Reset your Flavours password';
        return this.sendEmail({
            to: email,
            subject,
            html
        });
    }
    generateVerificationEmailHtml(data) {
        return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your Flavours account</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #6366f1;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 20px;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 8px;
                font-weight: 600;
                text-align: center;
                margin: 20px 0;
                transition: transform 0.2s;
            }
            .button:hover {
                transform: translateY(-2px);
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            .verification-code {
                background: #f3f4f6;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
                font-family: monospace;
                font-size: 18px;
                font-weight: bold;
                color: #1f2937;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🍃 Flavours</div>
                <h1 class="title">Verify Your Account</h1>
            </div>
            
            <div class="content">
                <p>Hi ${data.username},</p>
                
                <p>Welcome to Flavours! We're excited to have you join our creator community.</p>
                
                <p>To complete your account setup and start exploring amazing content, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center;">
                    <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
                </div>
                
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <div class="verification-code">${data.verificationUrl}</div>
                
                <p><strong>This verification link will expire in 24 hours.</strong></p>
                
                <p>If you didn't create an account with Flavours, you can safely ignore this email.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from Flavours Platform</p>
                <p>If you have any questions, please contact our support team.</p>
                <p>&copy; 2024 Flavours. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }
    generateWelcomeEmailHtml(data) {
        return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Flavours!</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #6366f1;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 20px;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 8px;
                font-weight: 600;
                text-align: center;
                margin: 20px 0;
                transition: transform 0.2s;
            }
            .button:hover {
                transform: translateY(-2px);
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            .features {
                background: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .feature {
                margin: 10px 0;
                padding: 8px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🍃 Flavours</div>
                <h1 class="title">Welcome to Flavours!</h1>
            </div>
            
            <div class="content">
                <p>Hi ${data.displayName},</p>
                
                <p>🎉 Congratulations! Your email has been verified and your Flavours account is now active.</p>
                
                <p>You're now part of our amazing creator community. Here's what you can do:</p>
                
                <div class="features">
                    <div class="feature">✨ Discover amazing creators and exclusive content</div>
                    <div class="feature">💬 Connect with your favorite creators through direct messaging</div>
                    <div class="feature">📱 Access content on any device, anywhere</div>
                    <div class="feature">🔒 Enjoy a secure and private platform</div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${environment_1.config.FRONTEND_URL}/feed" class="button">Start Exploring</a>
                </div>
                
                <p>Need help getting started? Check out our <a href="${environment_1.config.FRONTEND_URL}/help">help center</a> or reach out to our support team.</p>
                
                <p>Happy exploring!</p>
                <p>The Flavours Team</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from Flavours Platform</p>
                <p>If you have any questions, please contact our support team.</p>
                <p>&copy; 2024 Flavours. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }
    generatePasswordResetEmailHtml(email, resetToken, resetUrl) {
        return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your Flavours password</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #6366f1;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 20px;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
                color: white;
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 8px;
                font-weight: 600;
                text-align: center;
                margin: 20px 0;
                transition: transform 0.2s;
            }
            .button:hover {
                transform: translateY(-2px);
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            .warning {
                background: #fef2f2;
                border: 1px solid #fecaca;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                color: #991b1b;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🍃 Flavours</div>
                <h1 class="title">Password Reset Request</h1>
            </div>
            
            <div class="content">
                <p>Hi there,</p>
                
                <p>We received a request to reset the password for your Flavours account (${email}).</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${resetUrl}</p>
                
                <div class="warning">
                    <strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.
                </div>
                
                <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                
                <p>For security reasons, we recommend using a strong, unique password.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from Flavours Platform</p>
                <p>If you have any questions, please contact our support team.</p>
                <p>&copy; 2024 Flavours. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
    isEmailConfigured() {
        return this.isConfigured;
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=emailService.js.map