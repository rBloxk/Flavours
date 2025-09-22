"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchemas = void 0;
const joi_1 = __importDefault(require("joi"));
exports.userSchemas = {
    updateProfile: joi_1.default.object({
        displayName: joi_1.default.string().min(2).max(50).optional(),
        bio: joi_1.default.string().max(500).optional(),
        location: joi_1.default.string().max(100).optional(),
        website: joi_1.default.string().uri().optional(),
        interests: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
        isPublic: joi_1.default.boolean().optional(),
        showEmail: joi_1.default.boolean().optional(),
        showLocation: joi_1.default.boolean().optional()
    }),
    updateSettings: joi_1.default.object({
        emailNotifications: joi_1.default.object({
            newFollowers: joi_1.default.boolean().optional(),
            likesAndComments: joi_1.default.boolean().optional(),
            directMessages: joi_1.default.boolean().optional(),
            earningsUpdates: joi_1.default.boolean().optional()
        }).optional(),
        pushNotifications: joi_1.default.object({
            enabled: joi_1.default.boolean().optional(),
            sound: joi_1.default.boolean().optional(),
            vibration: joi_1.default.boolean().optional()
        }).optional(),
        privacy: joi_1.default.object({
            publicProfile: joi_1.default.boolean().optional(),
            allowComments: joi_1.default.boolean().optional(),
            allowShares: joi_1.default.boolean().optional()
        }).optional(),
        appearance: joi_1.default.object({
            theme: joi_1.default.string().valid('light', 'dark', 'system').optional(),
            language: joi_1.default.string().optional(),
            timeZone: joi_1.default.string().optional(),
            compactMode: joi_1.default.boolean().optional()
        }).optional()
    })
};
//# sourceMappingURL=users.js.map