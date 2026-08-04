// src/services/jwtService.js - JWT Token Management Service

import 'dotenv/config';

// ============================================
// JWT SERVICE
// ============================================

export const JwtService = {
  /**
   * Generate JWT token payload
   * @param {String} userId - User ID
   * @param {String} email - User email
   * @param {String} username - Username
   * @returns {Object} Token payload
   */
  generatePayload(userId, email, username) {
    return {
      sub: userId, // Standard JWT claim for subject (user ID)
      email,
      username,
      iat: Math.floor(Date.now() / 1000), // Issued at
    };
  },

  /**
   * Get token expiry time
   * @returns {String} Token expiry time (e.g., '7d')
   */
  getTokenExpiry() {
    return process.env.JWT_EXPIRY || '7d';
  },

  /**
   * Get JWT secret
   * @returns {String} JWT secret
   */
  getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    return secret;
  },

  /**
   * Verify secret is configured correctly
   * @returns {Boolean}
   */
  isConfigured() {
    const secret = process.env.JWT_SECRET;
    return secret && secret.length >= 32;
  },

  /**
   * Parse expiry time to milliseconds
   * @param {String} expiry - Expiry time (e.g., '7d', '24h', '30m')
   * @returns {Number} Milliseconds
   */
  parseExpiry(expiry) {
    const match = expiry.match(/^(\d+)([a-z])$/);
    if (!match) return null;

    const [, value, unit] = match;
    const num = parseInt(value);

    const units = {
      s: 1000,
      m: 1000 * 60,
      h: 1000 * 60 * 60,
      d: 1000 * 60 * 60 * 24,
      w: 1000 * 60 * 60 * 24 * 7,
    };

    return num * (units[unit] || 0);
  },

  /**
   * Get token expiry date
   * @returns {Date} Expiry date
   */
  getExpiryDate() {
    const expiry = this.getTokenExpiry();
    const ms = this.parseExpiry(expiry);
    if (!ms) return null;
    return new Date(Date.now() + ms);
  },

  /**
   * Validate token payload structure
   * @param {Object} payload - Token payload
   * @returns {Boolean}
   */
  isValidPayload(payload) {
    return (
      payload &&
      typeof payload === 'object' &&
      payload.sub &&
      payload.email &&
      payload.username
    );
  },

  /**
   * Check if token is expired
   * @param {Number} iat - Issued at timestamp
   * @param {Number} expiryMs - Expiry in milliseconds
   * @returns {Boolean}
   */
  isExpired(iat, expiryMs) {
    const issuedTime = iat * 1000; // Convert to milliseconds
    const expiryTime = issuedTime + expiryMs;
    return Date.now() > expiryTime;
  },

  /**
   * Get time until expiry in seconds
   * @param {Number} iat - Issued at timestamp
   * @param {Number} expiryMs - Expiry in milliseconds
   * @returns {Number} Seconds until expiry
   */
  getTimeUntilExpiry(iat, expiryMs) {
    const issuedTime = iat * 1000;
    const expiryTime = issuedTime + expiryMs;
    const remaining = expiryTime - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  },

  /**
   * Check if token should be refreshed (less than 1 day left)
   * @param {Number} iat - Issued at timestamp
   * @param {Number} expiryMs - Expiry in milliseconds
   * @returns {Boolean}
   */
  shouldRefresh(iat, expiryMs) {
    const secondsUntilExpiry = this.getTimeUntilExpiry(iat, expiryMs);
    const oneDayInSeconds = 24 * 60 * 60;
    return secondsUntilExpiry < oneDayInSeconds;
  },

  /**
   * Sanitize token (remove sensitive data)
   * @param {Object} payload - Token payload
   * @returns {Object} Sanitized payload
   */
  sanitize(payload) {
    const { sub, email, username, iat } = payload;
    return { sub, email, username, iat };
  },
};

export default JwtService;
