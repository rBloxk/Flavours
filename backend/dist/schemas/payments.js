"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentSchemas = void 0;
const joi_1 = __importDefault(require("joi"));
exports.paymentSchemas = {
    createPaymentMethod: joi_1.default.object({
        cardNumber: joi_1.default.string().pattern(/^\d{13,19}$/).required(),
        expiryMonth: joi_1.default.string().pattern(/^(0[1-9]|1[0-2])$/).required(),
        expiryYear: joi_1.default.string().pattern(/^\d{4}$/).required(),
        cvv: joi_1.default.string().pattern(/^\d{3,4}$/).required(),
        cardholderName: joi_1.default.string().min(2).max(100).required(),
        billingAddress: joi_1.default.object({
            line1: joi_1.default.string().min(1).max(200).required(),
            line2: joi_1.default.string().max(200).optional(),
            city: joi_1.default.string().min(1).max(100).required(),
            state: joi_1.default.string().min(1).max(100).required(),
            postalCode: joi_1.default.string().min(1).max(20).required(),
            country: joi_1.default.string().length(2).required()
        }).required()
    }),
    updatePaymentMethod: joi_1.default.object({
        cardholderName: joi_1.default.string().min(2).max(100).required(),
        billingAddress: joi_1.default.object({
            line1: joi_1.default.string().min(1).max(200).required(),
            line2: joi_1.default.string().max(200).optional(),
            city: joi_1.default.string().min(1).max(100).required(),
            state: joi_1.default.string().min(1).max(100).required(),
            postalCode: joi_1.default.string().min(1).max(20).required(),
            country: joi_1.default.string().length(2).required()
        }).required()
    }),
    createSubscriptionIntent: joi_1.default.object({
        creatorId: joi_1.default.string().uuid().required(),
        planId: joi_1.default.string().uuid().required(),
        paymentMethodId: joi_1.default.string().optional()
    }),
    createTipIntent: joi_1.default.object({
        creatorId: joi_1.default.string().uuid().required(),
        amount: joi_1.default.number().min(1).max(1000).required(),
        message: joi_1.default.string().max(500).optional(),
        paymentMethodId: joi_1.default.string().optional()
    }),
    createPPVIntent: joi_1.default.object({
        postId: joi_1.default.string().uuid().required(),
        paymentMethodId: joi_1.default.string().optional()
    })
};
//# sourceMappingURL=payments.js.map