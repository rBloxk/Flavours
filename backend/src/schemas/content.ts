import Joi from 'joi'

export const contentSchemas = {
  createPost: Joi.object({
    content: Joi.string().min(1).max(2000).required(),
    isPaid: Joi.boolean().default(false),
    price: Joi.when('isPaid', {
      is: true,
      then: Joi.number().min(1).max(1000).required(),
      otherwise: Joi.number().optional()
    }),
    isPreview: Joi.boolean().default(false),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    scheduledAt: Joi.date().iso().optional()
  }),

  updatePost: Joi.object({
    content: Joi.string().min(1).max(2000).optional(),
    isPaid: Joi.boolean().optional(),
    price: Joi.when('isPaid', {
      is: true,
      then: Joi.number().min(1).max(1000).required(),
      otherwise: Joi.number().optional()
    }),
    isPreview: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    scheduledAt: Joi.date().iso().optional()
  }),

  addComment: Joi.object({
    content: Joi.string().min(1).max(500).required()
  }),

  reportPost: Joi.object({
    reason: Joi.string().valid(
      'spam',
      'harassment',
      'inappropriate_content',
      'copyright_violation',
      'fake_content',
      'other'
    ).required(),
    description: Joi.string().max(500).optional()
  })
}
