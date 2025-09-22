"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const auth_2 = require("../schemas/auth");
const logger_1 = require("../utils/logger");
const emailService_1 = require("../services/emailService");
const verificationService_1 = require("../services/verificationService");
const router = (0, express_1.Router)();
router.post('/signup', (0, validation_1.validateRequest)(auth_2.signUpSchema), async (req, res) => {
    try {
        const { email, password, username, displayName, isCreator } = req.body;
        const { data: existingProfile } = await supabase_1.supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single();
        if (existingProfile) {
            return res.status(400).json({
                error: 'Username already exists'
            });
        }
        const { data: authData, error: authError } = await supabase_1.supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: false
        });
        if (authError) {
            logger_1.logger.error('Auth signup error:', authError);
            return res.status(400).json({
                error: authError.message
            });
        }
        if (!authData.user) {
            return res.status(400).json({
                error: 'Failed to create user'
            });
        }
        const { data: profileData, error: profileError } = await supabase_1.supabase
            .from('profiles')
            .insert({
            user_id: authData.user.id,
            username,
            display_name: displayName,
            is_creator: isCreator,
            email_verified: false,
            age_verified: true
        })
            .select()
            .single();
        if (profileError) {
            logger_1.logger.error('Profile creation error:', profileError);
            return res.status(400).json({
                error: 'Failed to create profile'
            });
        }
        if (isCreator) {
            const { error: creatorError } = await supabase_1.supabase
                .from('creators')
                .insert({
                user_id: authData.user.id,
                profile_id: profileData.id,
                subscription_price: 0,
                verification_status: 'pending'
            });
            if (creatorError) {
                logger_1.logger.error('Creator creation error:', creatorError);
            }
        }
        try {
            const verificationToken = await verificationService_1.verificationService.generateVerificationToken(authData.user.id, email, 'email_verification');
            const verificationUrl = verificationService_1.verificationService.generateVerificationUrl(verificationToken, 'email_verification');
            const emailSent = await emailService_1.emailService.sendVerificationEmail({
                email,
                username,
                verificationToken,
                verificationUrl
            });
            if (!emailSent) {
                logger_1.logger.warn('Failed to send verification email to:', email);
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to send verification email:', error);
        }
        res.status(201).json({
            message: 'User created successfully. Please check your email to verify your account.',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                profile: profileData
            },
            emailVerificationRequired: true
        });
    }
    catch (error) {
        logger_1.logger.error('Signup error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.post('/signin', (0, validation_1.validateRequest)(auth_2.signInSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data, error } = await supabase_1.supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            return res.status(401).json({
                error: error.message
            });
        }
        const { data: profile } = await supabase_1.supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
        res.json({
            message: 'Signed in successfully',
            user: data.user,
            session: data.session,
            profile
        });
    }
    catch (error) {
        logger_1.logger.error('Signin error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data: profile } = await supabase_1.supabase
            .from('profiles')
            .select(`
        *,
        creators (
          id,
          subscription_price,
          total_subscribers,
          total_earnings,
          verification_status
        )
      `)
            .eq('user_id', userId)
            .single();
        res.json({
            user: req.user,
            profile
        });
    }
    catch (error) {
        logger_1.logger.error('Get user error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.post('/signout', auth_1.authMiddleware, async (req, res) => {
    try {
        const { error } = await supabase_1.supabase.auth.signOut();
        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }
        res.json({
            message: 'Signed out successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Signout error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                error: 'Verification token is required'
            });
        }
        const validation = await verificationService_1.verificationService.validateVerificationToken(token, 'email_verification');
        if (!validation.valid) {
            return res.status(400).json({
                error: validation.error || 'Invalid verification token'
            });
        }
        const { userId, email } = validation;
        const { error: authError } = await supabase_1.supabase.auth.admin.updateUserById(userId, {
            email_confirm: true
        });
        if (authError) {
            logger_1.logger.error('Failed to confirm email in auth:', authError);
            return res.status(500).json({
                error: 'Failed to verify email'
            });
        }
        const { error: profileError } = await supabase_1.supabase
            .from('profiles')
            .update({ email_verified: true })
            .eq('user_id', userId);
        if (profileError) {
            logger_1.logger.error('Failed to update profile email verification:', profileError);
        }
        await verificationService_1.verificationService.markTokenAsUsed(token);
        const userData = await verificationService_1.verificationService.getUserByUserId(userId);
        if (userData) {
            await emailService_1.emailService.sendWelcomeEmail({
                email: userData.email,
                username: userData.username,
                displayName: userData.displayName
            });
        }
        res.json({
            message: 'Email verified successfully! Welcome to Flavours!',
            verified: true
        });
    }
    catch (error) {
        logger_1.logger.error('Email verification error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                error: 'Email is required'
            });
        }
        const userData = await verificationService_1.verificationService.getUserByEmail(email);
        if (!userData) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        const { data: profile } = await supabase_1.supabase
            .from('profiles')
            .select('email_verified')
            .eq('user_id', userData.userId)
            .single();
        if (profile?.email_verified) {
            return res.status(400).json({
                error: 'Email is already verified'
            });
        }
        const verificationToken = await verificationService_1.verificationService.generateVerificationToken(userData.userId, email, 'email_verification');
        const verificationUrl = verificationService_1.verificationService.generateVerificationUrl(verificationToken, 'email_verification');
        const emailSent = await emailService_1.emailService.sendVerificationEmail({
            email,
            username: userData.username,
            verificationToken,
            verificationUrl
        });
        if (!emailSent) {
            return res.status(500).json({
                error: 'Failed to send verification email'
            });
        }
        res.json({
            message: 'Verification email sent successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Resend verification error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                error: 'Email is required'
            });
        }
        const userData = await verificationService_1.verificationService.getUserByEmail(email);
        if (!userData) {
            return res.json({
                message: 'If an account with that email exists, a password reset link has been sent'
            });
        }
        const resetToken = await verificationService_1.verificationService.generateVerificationToken(userData.userId, email, 'password_reset');
        const resetUrl = verificationService_1.verificationService.generateVerificationUrl(resetToken, 'password_reset');
        const emailSent = await emailService_1.emailService.sendPasswordResetEmail(email, resetToken, resetUrl);
        if (!emailSent) {
            return res.status(500).json({
                error: 'Failed to send password reset email'
            });
        }
        res.json({
            message: 'If an account with that email exists, a password reset link has been sent'
        });
    }
    catch (error) {
        logger_1.logger.error('Forgot password error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({
                error: 'Token and new password are required'
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters long'
            });
        }
        const validation = await verificationService_1.verificationService.validateVerificationToken(token, 'password_reset');
        if (!validation.valid) {
            return res.status(400).json({
                error: validation.error || 'Invalid or expired reset token'
            });
        }
        const { userId } = validation;
        const { error: authError } = await supabase_1.supabase.auth.admin.updateUserById(userId, {
            password: newPassword
        });
        if (authError) {
            logger_1.logger.error('Failed to reset password:', authError);
            return res.status(500).json({
                error: 'Failed to reset password'
            });
        }
        await verificationService_1.verificationService.markTokenAsUsed(token);
        res.json({
            message: 'Password reset successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Reset password error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map