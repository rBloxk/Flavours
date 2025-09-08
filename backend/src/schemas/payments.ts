import Joi from 'joi'

export const paymentSchemas = {
  createPaymentMethod: Joi.object({
    cardNumber: Joi.string().pattern(/^\d{13,19}$/).required(),
    expiryMonth: Joi.string().pattern(/^(0[1-9]|1[0-2])$/).required(),
    expiryYear: Joi.string().pattern(/^\d{4}$/).required(),
    cvv: Joi.string().pattern(/^\d{3,4}$/).required(),
    cardholderName: Joi.string().min(2).max(100).required(),
    billingAddress: Joi.object({
      line1: Joi.string().min(1).max(200).required(),
      line2: Joi.string().max(200).optional(),
      city: Joi.string().min(1).max(100).required(),
      state: Joi.string().min(1).max(100).required(),
      postalCode: Joi.string().min(1).max(20).required(),
      country: Joi.string().length(2).required()
    }).required()
  }),

  updatePaymentMethod: Joi.object({
    cardholderName: Joi.string().min(2).max(100).required(),
    billingAddress: Joi.object({
      line1: Joi.string().min(1).max(200).required(),
      line2: Joi.string().max(200).optional(),
      city: Joi.string().min(1).max(100).required(),
      state: Joi.string().min(1).max(100).required(),
      postalCode: Joi.string().min(1).max(20).required(),
      country: Joi.string().length(2).required()
    }).required()
  }),

  createSubscriptionIntent: Joi.object({
    creatorId: Joi.string().uuid().required(),
    planId: Joi.string().uuid().required(),
    paymentMethodId: Joi.string().optional()
  }),

  createTipIntent: Joi.object({
    creatorId: Joi.string().uuid().required(),
    amount: Joi.number().min(1).max(1000).required(),
    message: Joi.string().max(500).optional(),
    paymentMethodId: Joi.string().optional()
  }),

  createPPVIntent: Joi.object({
    postId: Joi.string().uuid().required(),
    paymentMethodId: Joi.string().optional()
  })
}
