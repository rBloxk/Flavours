"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const payments_1 = require("../schemas/payments");
const paymentService_1 = require("../services/paymentService");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const paymentService = new paymentService_1.PaymentService();
router.get('/gateways', async (req, res) => {
    try {
        const gateways = paymentService.getAvailableGateways();
        res.json({
            gateways,
            recommended: paymentService.getRecommendedGateway()
        });
    }
    catch (error) {
        logger_1.logger.error('Get gateways error:', error);
        res.status(500).json({
            error: 'Failed to fetch payment gateways'
        });
    }
});
router.post('/methods', auth_1.authMiddleware, (0, validation_1.validateRequest)(payments_1.paymentSchemas.createPaymentMethod), async (req, res) => {
    try {
        const userId = req.user.id;
        const paymentData = req.body;
        if (!paymentService.validateCardNumber(paymentData.cardNumber)) {
            return res.status(400).json({
                error: 'Invalid card number'
            });
        }
        const cardType = paymentService.detectCardType(paymentData.cardNumber);
        if (cardType === 'unknown') {
            return res.status(400).json({
                error: 'Unsupported card type'
            });
        }
        if (!paymentService.validateCVV(paymentData.cvv, cardType)) {
            return res.status(400).json({
                error: 'Invalid CVV'
            });
        }
        if (!paymentService.validateExpiryDate(paymentData.expiryMonth, paymentData.expiryYear)) {
            return res.status(400).json({
                error: 'Card has expired'
            });
        }
        const paymentMethod = await paymentService.createPaymentMethod({
            ...paymentData,
            userId
        });
        res.status(201).json({
            message: 'Payment method created successfully',
            paymentMethod
        });
    }
    catch (error) {
        logger_1.logger.error('Create payment method error:', error);
        res.status(500).json({
            error: 'Failed to create payment method'
        });
    }
});
router.get('/methods', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const paymentMethods = await paymentService.getPaymentMethods(userId);
        res.json({
            paymentMethods
        });
    }
    catch (error) {
        logger_1.logger.error('Get payment methods error:', error);
        res.status(500).json({
            error: 'Failed to fetch payment methods'
        });
    }
});
router.put('/methods/:id', auth_1.authMiddleware, (0, validation_1.validateRequest)(payments_1.paymentSchemas.updatePaymentMethod), async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updateData = req.body;
        const paymentMethod = await paymentService.getPaymentMethod(id, userId);
        if (!paymentMethod) {
            return res.status(404).json({
                error: 'Payment method not found'
            });
        }
        const updatedMethod = await paymentService.updatePaymentMethod(id, updateData);
        res.json({
            message: 'Payment method updated successfully',
            paymentMethod: updatedMethod
        });
    }
    catch (error) {
        logger_1.logger.error('Update payment method error:', error);
        res.status(500).json({
            error: 'Failed to update payment method'
        });
    }
});
router.delete('/methods/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const paymentMethod = await paymentService.getPaymentMethod(id, userId);
        if (!paymentMethod) {
            return res.status(404).json({
                error: 'Payment method not found'
            });
        }
        await paymentService.deletePaymentMethod(id);
        res.json({
            message: 'Payment method deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete payment method error:', error);
        res.status(500).json({
            error: 'Failed to delete payment method'
        });
    }
});
router.post('/methods/:id/default', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const paymentMethod = await paymentService.getPaymentMethod(id, userId);
        if (!paymentMethod) {
            return res.status(404).json({
                error: 'Payment method not found'
            });
        }
        await paymentService.setDefaultPaymentMethod(id, userId);
        res.json({
            message: 'Default payment method updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Set default payment method error:', error);
        res.status(500).json({
            error: 'Failed to set default payment method'
        });
    }
});
router.post('/intents/subscription', auth_1.authMiddleware, (0, validation_1.validateRequest)(payments_1.paymentSchemas.createSubscriptionIntent), async (req, res) => {
    try {
        const userId = req.user.id;
        const { creatorId, planId, paymentMethodId } = req.body;
        const paymentIntent = await paymentService.createSubscriptionPayment({
            userId,
            creatorId,
            planId,
            paymentMethodId
        });
        res.status(201).json({
            message: 'Payment intent created successfully',
            paymentIntent
        });
    }
    catch (error) {
        logger_1.logger.error('Create subscription payment error:', error);
        res.status(500).json({
            error: 'Failed to create subscription payment'
        });
    }
});
router.post('/intents/tip', auth_1.authMiddleware, (0, validation_1.validateRequest)(payments_1.paymentSchemas.createTipIntent), async (req, res) => {
    try {
        const userId = req.user.id;
        const { creatorId, amount, message, paymentMethodId } = req.body;
        const paymentIntent = await paymentService.createTipPayment({
            userId,
            creatorId,
            amount,
            message,
            paymentMethodId
        });
        res.status(201).json({
            message: 'Tip payment intent created successfully',
            paymentIntent
        });
    }
    catch (error) {
        logger_1.logger.error('Create tip payment error:', error);
        res.status(500).json({
            error: 'Failed to create tip payment'
        });
    }
});
router.post('/intents/ppv', auth_1.authMiddleware, (0, validation_1.validateRequest)(payments_1.paymentSchemas.createPPVIntent), async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId, paymentMethodId } = req.body;
        const paymentIntent = await paymentService.createPPVPayment({
            userId,
            postId,
            paymentMethodId
        });
        res.status(201).json({
            message: 'PPV payment intent created successfully',
            paymentIntent
        });
    }
    catch (error) {
        logger_1.logger.error('Create PPV payment error:', error);
        res.status(500).json({
            error: 'Failed to create PPV payment'
        });
    }
});
router.post('/intents/:id/confirm', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const result = await paymentService.confirmPaymentIntent(id, userId);
        res.json({
            message: 'Payment confirmed successfully',
            result
        });
    }
    catch (error) {
        logger_1.logger.error('Confirm payment error:', error);
        res.status(500).json({
            error: 'Failed to confirm payment'
        });
    }
});
router.get('/transactions', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, type } = req.query;
        const transactions = await paymentService.getTransactionHistory({
            userId,
            page: Number(page),
            limit: Number(limit),
            type: type
        });
        res.json({
            transactions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: transactions.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get transaction history error:', error);
        res.status(500).json({
            error: 'Failed to fetch transaction history'
        });
    }
});
router.post('/fees/calculate', auth_1.authMiddleware, async (req, res) => {
    try {
        const { amount, provider } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: 'Invalid amount'
            });
        }
        const fees = paymentService.calculateFees(amount, provider);
        const netAmount = amount - fees;
        res.json({
            amount,
            fees,
            netAmount,
            provider: provider || paymentService.getRecommendedGateway()
        });
    }
    catch (error) {
        logger_1.logger.error('Calculate fees error:', error);
        res.status(500).json({
            error: 'Failed to calculate fees'
        });
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map