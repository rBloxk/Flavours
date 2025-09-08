import Joi from 'joi'

export const adminSchemas = {
  reviewModeration: Joi.object({
    action: Joi.string().valid('approve', 'reject', 'escalate').required(),
    reason: Joi.string().max(500).optional()
  }),

  handleReport: Joi.object({
    action: Joi.string().valid('dismiss', 'warn', 'suspend', 'ban').required(),
    notes: Joi.string().max(500).optional()
  }),

  updateUserStatus: Joi.object({
    status: Joi.string().valid('active', 'suspended', 'banned').required(),
    reason: Joi.string().max(500).optional()
  }),

  verifyCreator: Joi.object({
    status: Joi.string().valid('pending', 'verified', 'rejected').required(),
    notes: Joi.string().max(500).optional()
  })
}
