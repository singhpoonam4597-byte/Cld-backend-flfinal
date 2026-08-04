// src/utils/helpers.js - Helper Functions

import { LIMITS } from './constants.js';

// ============================================
// STRING HELPERS
// ============================================

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}

export function truncate(text, length = 100) {
  if (text.length <= length) return text;
  return text.substring(0, length - 3) + '...';
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function isValidObjectId(id) {
  return typeof id === 'string' && id.length > 0;
}

export function validatePassword(password) {
  return password && password.length >= LIMITS.MIN_PASSWORD_LENGTH;
}

// ============================================
// DATE HELPERS
// ============================================

export function getTimestamp() {
  return new Date();
}

export function getISOString(date = new Date()) {
  return date.toISOString();
}

export function isExpired(expiresAt) {
  return new Date(expiresAt) < new Date();
}

export function addHours(hours = 1) {
  const now = new Date();
  now.setHours(now.getHours() + hours);
  return now;
}

export function addDays(days = 1) {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now;
}

// ============================================
// PAGINATION HELPERS
// ============================================

export function calculatePagination(total, page, limit) {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPreviousPage: page > 1,
  };
}

export function getPaginationData(total, page, limit, items) {
  return {
    items,
    pagination: calculatePagination(total, page, limit),
  };
}

// ============================================
// RESPONSE HELPERS
// ============================================

export function successResponse(statusCode = 200, message, data = null) {
  const response = {
    statusCode,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return response;
}

export function errorResponse(statusCode = 500, message, error = null) {
  const response = {
    statusCode,
    message,
  };

  if (error) {
    response.error = error;
  }

  return response;
}

// ============================================
// ARRAY HELPERS
// ============================================

export function removeFromArray(array, item) {
  return array.filter((el) => el !== item);
}

export function removeDuplicates(array) {
  return [...new Set(array)];
}

export function groupBy(array, key) {
  return array.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
}

export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================
// OBJECT HELPERS
// ============================================

export function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

export function pick(obj, keys) {
  const result = {};
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
}

export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

// ============================================
// TYPE HELPERS
// ============================================

export function isString(value) {
  return typeof value === 'string';
}

export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value) {
  return typeof value === 'boolean';
}

export function isArray(value) {
  return Array.isArray(value);
}

export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isNull(value) {
  return value === null;
}

export function isUndefined(value) {
  return value === undefined;
}

// ============================================
// SEARCH & FILTER HELPERS
// ============================================

export function searchInArray(array, searchTerm, fields) {
  const term = searchTerm.toLowerCase();
  return array.filter((item) =>
    fields.some((field) =>
      String(item[field]).toLowerCase().includes(term)
    )
  );
}

export function filterByDate(items, field, startDate, endDate) {
  return items.filter((item) => {
    const date = new Date(item[field]);
    return date >= startDate && date <= endDate;
  });
}

// ============================================
// RANDOM HELPERS
// ============================================

export function generateRandomId(length = 12) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

export function generateRandomString(length = 20) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================
// FILE HELPERS
// ============================================

export function getFileExtension(filename) {
  return filename.substring(filename.lastIndexOf('.') + 1);
}

export function getFileName(filename) {
  return filename.substring(0, filename.lastIndexOf('.'));
}

export function isImageFile(filename) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const ext = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

// ============================================
// FORMAT HELPERS
// ============================================

export function formatNumber(num) {
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num;
}

export function formatDate(date, format = 'short') {
  const d = new Date(date);
  if (format === 'short') {
    return d.toLocaleDateString();
  }
  return d.toLocaleString();
}

export function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

export default {
  slugify,
  validateEmail,
  validateUsername,
  truncate,
  isValidUrl,
  isValidObjectId,
  validatePassword,
  getTimestamp,
  getISOString,
  isExpired,
  addHours,
  addDays,
  calculatePagination,
  getPaginationData,
  successResponse,
  errorResponse,
  removeFromArray,
  removeDuplicates,
  groupBy,
  chunk,
  omit,
  pick,
  isEmpty,
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isNull,
  isUndefined,
  searchInArray,
  filterByDate,
  generateRandomId,
  generateRandomString,
  getFileExtension,
  getFileName,
  isImageFile,
  formatNumber,
  formatDate,
  formatTime,
};
