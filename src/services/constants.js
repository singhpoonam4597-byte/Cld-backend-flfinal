// src/utils/constants.js - Application Constants

// ============================================
// NOTIFICATION TYPES
// ============================================

export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  MESSAGE: 'message',
  REPLY: 'reply',
};

// ============================================
// USER ROLES & PERMISSIONS
// ============================================

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

// ============================================
// LIMITS & CONSTRAINTS
// ============================================

export const LIMITS = {
  MAX_POST_LENGTH: 1000,
  MAX_COMMENT_LENGTH: 500,
  MAX_BIO_LENGTH: 200,
  MAX_DISPLAY_NAME_LENGTH: 50,
  MAX_USERNAME_LENGTH: 30,
  MIN_USERNAME_LENGTH: 3,
  MAX_MESSAGE_LENGTH: 1000,
  MIN_PASSWORD_LENGTH: 6,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  PAGINATION_LIMIT: 100,
  DEFAULT_PAGE_SIZE: 10,
  MAX_NOTIFICATIONS: 20,
};

// ============================================
// TIME CONSTANTS (in milliseconds)
// ============================================

export const TIME = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  STORY_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  TOKEN_EXPIRY: '7d',
};

// ============================================
// ERROR CODES
// ============================================

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  BAD_REQUEST: 'BAD_REQUEST',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  FOREIGN_KEY_ERROR: 'FOREIGN_KEY_ERROR',
};

// ============================================
// RESPONSE MESSAGES
// ============================================

export const MESSAGES = {
  // Auth
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_CHANGED: 'Password changed successfully',

  // Posts
  POST_CREATED: 'Post created successfully',
  POST_DELETED: 'Post deleted successfully',
  POST_LIKED: 'Post liked successfully',
  POST_UNLIKED: 'Post unliked successfully',
  COMMENT_ADDED: 'Comment added successfully',
  COMMENT_DELETED: 'Comment deleted successfully',

  // Users
  PROFILE_UPDATED: 'Profile updated successfully',
  USER_NOT_FOUND: 'User not found',
  PROFILE_RETRIEVED: 'Profile retrieved successfully',

  // Follows
  USER_FOLLOWED: 'User followed successfully',
  USER_UNFOLLOWED: 'User unfollowed successfully',

  // Messages
  MESSAGE_SENT: 'Message sent successfully',
  MESSAGE_DELETED: 'Message deleted successfully',
  MESSAGE_READ: 'Message marked as read',

  // Notifications
  NOTIFICATION_READ: 'Notification marked as read',
  ALL_NOTIFICATIONS_READ: 'All notifications marked as read',

  // Errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_REGISTERED: 'Email already registered',
  USERNAME_ALREADY_TAKEN: 'Username already taken',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  INVALID_EMAIL: 'Invalid email address',
  CANNOT_FOLLOW_SELF: 'Cannot follow yourself',
  CANNOT_MESSAGE_SELF: 'Cannot message yourself',
  UNAUTHORIZED_ACTION: 'Unauthorized action',
  RESOURCE_NOT_FOUND: 'Resource not found',
  ALREADY_LIKED: 'Post already liked',
  NOT_LIKED: 'Post not liked',
};

// ============================================
// CLOUDINARY SETTINGS
// ============================================

export const CLOUDINARY = {
  UPLOAD_FOLDER: 'social-app',
  POST_FOLDER: 'posts',
  AVATAR_FOLDER: 'avatars',
  STORY_FOLDER: 'stories',
  MESSAGE_FOLDER: 'messages',
  QUALITY: 'auto',
  FETCH_FORMAT: 'auto',
};

// ============================================
// CORS SETTINGS
// ============================================

export const CORS = {
  CREDENTIALS: true,
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
};

// ============================================
// JWT SETTINGS
// ============================================

export const JWT = {
  EXPIRY: process.env.JWT_EXPIRY || '7d',
};

export default {
  NOTIFICATION_TYPES,
  USER_ROLES,
  LIMITS,
  TIME,
  ERROR_CODES,
  MESSAGES,
  CLOUDINARY,
  CORS,
  JWT,
};
