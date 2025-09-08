import Joi from 'joi'

export const signUpSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  displayName: Joi.string().min(2).max(50).required(),
  isCreator: Joi.boolean().default(false)
})

export const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})