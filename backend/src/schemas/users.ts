import Joi from 'joi'

export const userSchemas = {
  updateProfile: Joi.object({
    displayName: Joi.string().min(2).max(50).optional(),
    bio: Joi.string().max(500).optional(),
    location: Joi.string().max(100).optional(),
    website: Joi.string().uri().optional(),
    interests: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    isPublic: Joi.boolean().optional(),
    showEmail: Joi.boolean().optional(),
    showLocation: Joi.boolean().optional()
  }),

  updateSettings: Joi.object({
    emailNotifications: Joi.object({
      newFollowers: Joi.boolean().optional(),
      likesAndComments: Joi.boolean().optional(),
      directMessages: Joi.boolean().optional(),
      earningsUpdates: Joi.boolean().optional()
    }).optional(),
    pushNotifications: Joi.object({
      enabled: Joi.boolean().optional(),
      sound: Joi.boolean().optional(),
      vibration: Joi.boolean().optional()
    }).optional(),
    privacy: Joi.object({
      publicProfile: Joi.boolean().optional(),
      allowComments: Joi.boolean().optional(),
      allowShares: Joi.boolean().optional()
    }).optional(),
    appearance: Joi.object({
      theme: Joi.string().valid('light', 'dark', 'system').optional(),
      language: Joi.string().optional(),
      timeZone: Joi.string().optional(),
      compactMode: Joi.boolean().optional()
    }).optional()
  })
}
