"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
const environment_1 = require("../config/environment");
class VerificationService {
    constructor() {
        this.TOKEN_EXPIRY_HOURS = {
            email_verification: 24,
            password_reset: 1
        };
    }
    async generateVerificationToken(userId, email, type = 'email_verification') {
        try {
            const token = crypto_1.default.randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS[type]);
            const { error } = await supabase_1.supabase
                .from('verification_tokens')
                .insert({
                token,
                user_id: userId,
                email,
                type,
                expires_at: expiresAt.toISOString(),
                created_at: new Date().toISOString()
            });
            if (error) {
                logger_1.logger.error('Failed to store verification token:', error);
                throw new Error('Failed to generate verification token');
            }
            logger_1.logger.info(`Generated ${type} token for user ${userId}`);
            return token;
        }
        catch (error) {
            logger_1.logger.error('Error generating verification token:', error);
            throw error;
        }
    }
    async validateVerificationToken(token, type = 'email_verification') {
        try {
            const { data: tokenData, error } = await supabase_1.supabase
                .from('verification_tokens')
                .select('*')
                .eq('token', token)
                .eq('type', type)
                .eq('used', false)
                .single();
            if (error || !tokenData) {
                return { valid: false, error: 'Invalid or expired token' };
            }
            const now = new Date();
            const expiresAt = new Date(tokenData.expires_at);
            if (now > expiresAt) {
                await this.markTokenAsUsed(token);
                return { valid: false, error: 'Token has expired' };
            }
            return {
                valid: true,
                userId: tokenData.user_id,
                email: tokenData.email
            };
        }
        catch (error) {
            logger_1.logger.error('Error validating verification token:', error);
            return { valid: false, error: 'Token validation failed' };
        }
    }
    async markTokenAsUsed(token) {
        try {
            const { error } = await supabase_1.supabase
                .from('verification_tokens')
                .update({ used: true, used_at: new Date().toISOString() })
                .eq('token', token);
            if (error) {
                logger_1.logger.error('Failed to mark token as used:', error);
            }
        }
        catch (error) {
            logger_1.logger.error('Error marking token as used:', error);
        }
    }
    async cleanupExpiredTokens() {
        try {
            const now = new Date().toISOString();
            const { error } = await supabase_1.supabase
                .from('verification_tokens')
                .delete()
                .lt('expires_at', now);
            if (error) {
                logger_1.logger.error('Failed to cleanup expired tokens:', error);
            }
            else {
                logger_1.logger.info('Cleaned up expired verification tokens');
            }
        }
        catch (error) {
            logger_1.logger.error('Error cleaning up expired tokens:', error);
        }
    }
    generateVerificationUrl(token, type = 'email_verification') {
        const endpoint = type === 'email_verification' ? 'verify-email' : 'reset-password';
        return `${environment_1.config.FRONTEND_URL}/auth/${endpoint}?token=${token}`;
    }
    async getUserByEmail(email) {
        try {
            const { data: profile, error } = await supabase_1.supabase
                .from('profiles')
                .select('user_id, username')
                .eq('email', email)
                .single();
            if (error || !profile) {
                return null;
            }
            return {
                userId: profile.user_id,
                username: profile.username
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting user by email:', error);
            return null;
        }
    }
    async getUserByUserId(userId) {
        try {
            const { data: profile, error } = await supabase_1.supabase
                .from('profiles')
                .select('username, display_name')
                .eq('user_id', userId)
                .single();
            if (error || !profile) {
                return null;
            }
            const { data: authUser, error: authError } = await supabase_1.supabase.auth.admin.getUserById(userId);
            if (authError || !authUser.user) {
                return null;
            }
            return {
                email: authUser.user.email,
                username: profile.username,
                displayName: profile.display_name
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting user by user ID:', error);
            return null;
        }
    }
}
exports.verificationService = new VerificationService();
//# sourceMappingURL=verificationService.js.map