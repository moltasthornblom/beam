import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().min(3).trim().required(),
  password: Joi.string().min(6).trim().required(),
});

export const loginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().trim().required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().trim().required(),
  newPassword: Joi.string().trim().required(),
});

export const listVideosSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional(),
});

