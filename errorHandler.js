// src/middleware/errorHandler.js - Global Error Handler

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const Errors = {
  UNAUTHORIZED: () =>
    new AppError('Unauthorized', 401, 'UNAUTHORIZED'),
  FORBIDDEN: () =>
    new AppError('Forbidden', 403, 'FORBIDDEN'),
  NOT_FOUND: (resource = 'Resource') =>
    new AppError(`${resource} not found`, 404, 'NOT_FOUND'),
  CONFLICT: (message) =>
    new AppError(message, 409, 'CONFLICT'),
  VALIDATION: (message) =>
    new AppError(message, 400, 'VALIDATION_ERROR'),
  INTERNAL_ERROR: (message) =>
    new AppError(message, 500, 'INTERNAL_ERROR'),
  BAD_REQUEST: (message) =>
    new AppError(message, 400, 'BAD_REQUEST'),
  UNPROCESSABLE_ENTITY: (message) =>
    new AppError(message, 422, 'UNPROCESSABLE_ENTITY'),
};

export async function errorHandler(error, request, reply) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  // Log error details
  if (statusCode >= 500) {
    console.error('🔴 Server Error:', {
      statusCode,
      message,
      path: request.url,
      method: request.method,
      stack: error.stack,
    });
  }

  // Handle validation errors from JSON Schema
  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      message: 'Validation error',
      errors: error.validation,
    });
  }

  // Handle JWT errors
  if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_COOKIE_HEADER') {
    return reply.status(401).send({
      statusCode: 401,
      message: 'Unauthorized: No authorization header',
      error: 'NO_TOKEN',
    });
  }

  if (error.code === 'FST_JWT_BAD_REQUEST') {
    return reply.status(401).send({
      statusCode: 401,
      message: 'Unauthorized: Invalid token',
      error: 'INVALID_TOKEN',
    });
  }

  // Handle Prisma errors
  if (error.code === 'P2002') {
    // Unique constraint violation
    return reply.status(409).send({
      statusCode: 409,
      message: 'Unique constraint violation',
      error: 'DUPLICATE_ENTRY',
      field: error.meta?.target?.[0],
    });
  }

  if (error.code === 'P2025') {
    // Record not found
    return reply.status(404).send({
      statusCode: 404,
      message: 'Record not found',
      error: 'NOT_FOUND',
    });
  }

  if (error.code === 'P2003') {
    // Foreign key constraint
    return reply.status(400).send({
      statusCode: 400,
      message: 'Referenced record does not exist',
      error: 'FOREIGN_KEY_ERROR',
    });
  }

  // Handle custom AppError
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      message: error.message,
      error: error.code,
    });
  }

  // Default error response
  return reply.status(statusCode).send({
    statusCode,
    message,
    error: error.code || 'INTERNAL_ERROR',
  });
}

export default {
  AppError,
  Errors,
  errorHandler,
};
