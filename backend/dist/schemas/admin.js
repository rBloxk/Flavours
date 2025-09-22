"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSchemas = void 0;
const joi_1 = __importDefault(require("joi"));
exports.adminSchemas = {
    reviewModeration: joi_1.default.object({
        action: joi_1.default.string().valid('approve', 'reject', 'escalate').required(),
        reason: joi_1.default.string().max(500).optional()
    }),
    handleReport: joi_1.default.object({
        action: joi_1.default.string().valid('dismiss', 'warn', 'suspend', 'ban').required(),
        notes: joi_1.default.string().max(500).optional()
    }),
    updateUserStatus: joi_1.default.object({
        status: joi_1.default.string().valid('active', 'suspended', 'banned').required(),
        reason: joi_1.default.string().max(500).optional()
    }),
    verifyCreator: joi_1.default.object({
        status: joi_1.default.string().valid('pending', 'verified', 'rejected').required(),
        notes: joi_1.default.string().max(500).optional()
    })
};
//# sourceMappingURL=admin.js.map