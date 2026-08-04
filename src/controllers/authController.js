// src/controllers/authController.js - Authentication Controller

import bcryptjs from 'bcryptjs';
import { UsersService } from '../services/prismaService.js';
import { Errors } from '../middleware/errorHandler.js';
import { MESSAGES } from '../utils/constants.js';
import { validateEmail, validateUsername } from '../utils/helpers.js';

// ============================================
// SIGNUP CONTROLLER
// ============================================

export async function signup(request, reply) {
  const { email, username, displayName, password, passwordConfirm } =
    request.body;

  // Validation
  if (!email || !username || !displayName || !password) {
    throw Errors.VALIDATION('All fields are required');
  }

  if (!validateEmail(email)) {
    throw Errors.VALIDATION(MESSAGES.INVALID_EMAIL);
  }

  if (!validateUsername(username)) {
    throw Errors.VALIDATION(
      'Username must be 3-30 characters and contain only alphanumeric characters and underscores'
    );
  }

  if (password !== passwordConfirm) {
    throw Errors.VALIDATION(MESSAGES.PASSWORDS_DO_NOT_MATCH);
  }

  if (password.length < 6) {
    throw Errors.VALIDATION('Password must be at least 6 characters');
  }

  // Check if email or username already exists
  const existingUser = await UsersService.getByEmail(email);
  if (existingUser) {
    throw Errors.CONFLICT(MESSAGES.EMAIL_ALREADY_REGISTERED);
  }

  const existingUsername = await UsersService.getByUsername(username);
  if (existingUsername) {
    throw Errors.CONFLICT(MESSAGES.USERNAME_ALREADY_TAKEN);
  }

  // Hash password
  const hashedPassword = await bcryptjs.hash(password, 10);

  // Create user
  const user = await UsersService.create(
    email,
    username,
    displayName,
    hashedPassword
  );

  // Generate JWT token
  const token = request.server.jwt.sign({
    sub: user.id,
    email: user.email,
    username: user.username,
  });

  reply.status(201).send({
    statusCode: 201,
    message: MESSAGES.SIGNUP_SUCCESS,
    user,
    token,
  });
}

// ============================================
// LOGIN CONTROLLER
// ============================================

export async function login(request, reply) {
  const { email, password } = request.body;

  if (!email || !password) {
    throw Errors.VALIDATION('Email and password are required');
  }

  if (!validateEmail(email)) {
    throw Errors.VALIDATION(MESSAGES.INVALID_EMAIL);
  }

  // Find user by email
  const user = await UsersService.getByEmail(email);

  if (!user) {
    throw Errors.VALIDATION(MESSAGES.INVALID_CREDENTIALS);
  }

  // Verify password
  const passwordMatch = await bcryptjs.compare(password, user.password);

  if (!passwordMatch) {
    throw Errors.VALIDATION(MESSAGES.INVALID_CREDENTIALS);
  }

  // Generate JWT token
  const token = request.server.jwt.sign({
    sub: user.id,
    email: user.email,
    username: user.username,
  });

  reply.send({
    statusCode: 200,
    message: MESSAGES.LOGIN_SUCCESS,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
    },
    token,
  });
}

// ============================================
// GET CURRENT USER CONTROLLER
// ============================================

export async function getCurrentUser(request, reply) {
  const userId = request.user.sub;

  const user = await UsersService.getProfile(userId);

  if (!user) {
    throw Errors.NOT_FOUND('User');
  }

  reply.send({
    statusCode: 200,
    message: MESSAGES.PROFILE_RETRIEVED,
    user,
  });
}

// ============================================
// CHANGE PASSWORD CONTROLLER
// ============================================

export async function changePassword(request, reply) {
  const userId = request.user.sub;
  const { currentPassword, newPassword, passwordConfirm } = request.body;

  if (!currentPassword || !newPassword || !passwordConfirm) {
    throw Errors.VALIDATION('All password fields are required');
  }

  if (newPassword !== passwordConfirm) {
    throw Errors.VALIDATION(MESSAGES.PASSWORDS_DO_NOT_MATCH);
  }

  if (newPassword.length < 6) {
    throw Errors.VALIDATION('Password must be at least 6 characters');
  }

  // Get user with password field
  const user = await UsersService.getById(userId);

  if (!user) {
    throw Errors.NOT_FOUND('User');
  }

  // Verify current password
  const passwordMatch = await bcryptjs.compare(currentPassword, user.password);

  if (!passwordMatch) {
    throw Errors.VALIDATION('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcryptjs.hash(newPassword, 10);

  // Update password
  await UsersService.updatePassword(userId, hashedPassword);

  reply.send({
    statusCode: 200,
    message: MESSAGES.PASSWORD_CHANGED,
  });
}

// ============================================
// LOGOUT CONTROLLER
// ============================================

export async function logout(request, reply) {
  // With JWT, logout is handled on the frontend by removing the token
  // This endpoint is optional and can be used for additional cleanup
  
  reply.send({
    statusCode: 200,
    message: MESSAGES.LOGOUT_SUCCESS,
  });
}

// ============================================
// EXPORT ALL CONTROLLERS
// ============================================

export default {
  signup,
  login,
  getCurrentUser,
  changePassword,
  logout,
};
