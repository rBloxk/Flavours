"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentSchemas = void 0;
const joi_1 = __importDefault(require("joi"));
exports.contentSchemas = {
    createPost: joi_1.default.object({
        content: joi_1.default.string().min(1).max(2000).required(),
        isPaid: joi_1.default.boolean().default(false),
        price: joi_1.default.when('isPaid', {
            is: true,
            then: joi_1.default.number().min(1).max(1000).required(),
            otherwise: joi_1.default.number().optional()
        }),
        isPreview: joi_1.default.boolean().default(false),
        tags: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
        scheduledAt: joi_1.default.date().iso().optional()
    }),
    updatePost: joi_1.default.object({
        content: joi_1.default.string().min(1).max(2000).optional(),
        isPaid: joi_1.default.boolean().optional(),
        price: joi_1.default.when('isPaid', {
            is: true,
            then: joi_1.default.number().min(1).max(1000).required(),
            otherwise: joi_1.default.number().optional()
        }),
        isPreview: joi_1.default.boolean().optional(),
        tags: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
        scheduledAt: joi_1.default.date().iso().optional()
    }),
    addComment: joi_1.default.object({
        content: joi_1.default.string().min(1).max(500).required()
    }),
    reportPost: joi_1.default.object({
        reason: joi_1.default.string().valid('spam', 'harassment', 'inappropriate_content', 'copyright_violation', 'fake_content', 'other').required(),
        description: joi_1.default.string().max(500).optional()
    })
};
//# sourceMappingURL=content.js.map