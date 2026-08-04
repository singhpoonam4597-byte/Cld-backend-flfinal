// src/middleware/validation.js - Input Validation Schemas

import Joi from 'joi';
import { Errors } from './errorHandler.js';

// ============================================
// AUTH VALIDATION SCHEMAS
// ============================================

export const authSchemas = {
  signup: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required',
      }),
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username must contain only alphanumeric characters',
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username cannot exceed 30 characters',
      }),
    displayName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Display name must be at least 2 characters',
        'string.max': 'Display name cannot exceed 50 characters',
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters',
      }),
    passwordConfirm: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
      }),
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    passwordConfirm: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required(),
  }),
};

// ============================================
// POST VALIDATION SCHEMAS
// ============================================

export const postSchemas = {
  create: Joi.object({
    content: Joi.string()
      .min(1)
      .max(1000)
      .required()
      .messages({
        'string.max': 'Post content cannot exceed 1000 characters',
      }),
    image: Joi.string()
      .uri()
      .optional(),
  }),

  comment: Joi.object({
    content: Joi.string()
      .min(1)
      .max(500)
      .required()
      .messages({
        'string.max': 'Comment cannot exceed 500 characters',
      }),
  }),
};

// ============================================
// USER VALIDATION SCHEMAS
// ============================================

export const userSchemas = {
  updateProfile: Joi.object({
    displayName: Joi.string()
      .min(2)
      .max(50)
      .optional(),
    bio: Joi.string()
      .max(200)
      .optional()
      .allow(null, ''),
    avatar: Joi.string()
      .uri()
      .optional(),
    isPrivate: Joi.boolean()
      .optional(),
  }),

  search: Joi.object({
    q: Joi.string()
      .min(2)
      .max(50)
      .required(),
    limit: Joi.number()
      .min(1)
      .max(100)
      .optional()
      .default(10),
  }),
};

// ============================================
// MESSAGE VALIDATION SCHEMAS
// ============================================

export const messageSchemas = {
  send: Joi.object({
    recipientId: Joi.string()
      .required(),
    content: Joi.string()
      .max(1000)
      .optional(),
    image: Joi.string()
      .uri()
      .optional(),
  }).or('content', 'image'),
};

// ============================================
// NOTIFICATION VALIDATION SCHEMAS
// ============================================

export const notificationSchemas = {
  query: Joi.object({
    limit: Joi.number()
      .min(1)
      .max(100)
      .optional()
      .default(20),
  }),
};

// ============================================
// PAGINATION HELPERS
// ============================================

export function getPaginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

export function validateRequest(schema) {
  return async (request, reply) => {
    try {
      const validated = await schema.validateAsync(request.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      request.body = validated;
    } catch (error) {
      const errors = {};
      error.details.forEach((detail) => {
        errors[detail.path[0]] = detail.message;
      });
      throw Errors.VALIDATION(
        Object.values(errors).join('; ')
      );
    }
  };
}

export function validateQuery(schema) {
  return async (request, reply) => {
    try {
      const validated = await schema.validateAsync(request.query, {
        abortEarly: false,
        stripUnknown: true,
      });
      request.query = validated;
    } catch (error) {
      throw Errors.VALIDATION(error.message);
    }
  };
}

export default {
  authSchemas,
  postSchemas,
  userSchemas,
  messageSchemas,
  notificationSchemas,
  getPaginationParams,
  validateRequest,
  validateQuery,
};
