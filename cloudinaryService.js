// src/services/cloudinaryService.js - Cloudinary Image Upload Service

import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY } from '../utils/constants.js';
import 'dotenv/config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================
// CLOUDINARY SERVICE
// ============================================

export const CloudinaryService = {
  /**
   * Upload image from buffer (used with multipart uploads)
   * @param {Buffer} buffer - File buffer
   * @param {String} folder - Folder path in Cloudinary
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(buffer, folder = CLOUDINARY.UPLOAD_FOLDER) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: folder,
          quality: CLOUDINARY.QUALITY,
          fetch_format: CLOUDINARY.FETCH_FORMAT,
          max_bytes: 10 * 1024 * 1024, // 10MB limit
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Upload failed: ${error.message}`));
          } else {
            resolve(result);
          }
        }
      );

      // Handle stream errors
      stream.on('error', (err) => {
        reject(new Error(`Stream error: ${err.message}`));
      });

      stream.end(buffer);
    });
  },

  /**
   * Upload image from base64
   * @param {String} base64Data - Base64 encoded image
   * @param {String} folder - Folder path in Cloudinary
   * @returns {Promise<Object>} Upload result
   */
  async uploadBase64(base64Data, folder = CLOUDINARY.UPLOAD_FOLDER) {
    try {
      const result = await cloudinary.uploader.upload(base64Data, {
        resource_type: 'auto',
        folder: folder,
        quality: CLOUDINARY.QUALITY,
        fetch_format: CLOUDINARY.FETCH_FORMAT,
      });
      return result;
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  },

  /**
   * Upload avatar image
   * @param {Buffer} buffer - File buffer
   * @param {String} userId - User ID for folder organization
   * @returns {Promise<Object>} Upload result
   */
  async uploadAvatar(buffer, userId) {
    try {
      const folder = `${CLOUDINARY.UPLOAD_FOLDER}/${CLOUDINARY.AVATAR_FOLDER}/${userId}`;
      return await this.uploadImage(buffer, folder);
    } catch (error) {
      throw new Error(`Avatar upload failed: ${error.message}`);
    }
  },

  /**
   * Upload post image
   * @param {Buffer} buffer - File buffer
   * @param {String} userId - User ID for folder organization
   * @returns {Promise<Object>} Upload result
   */
  async uploadPost(buffer, userId) {
    try {
      const folder = `${CLOUDINARY.UPLOAD_FOLDER}/${CLOUDINARY.POST_FOLDER}/${userId}`;
      return await this.uploadImage(buffer, folder);
    } catch (error) {
      throw new Error(`Post upload failed: ${error.message}`);
    }
  },

  /**
   * Upload story image
   * @param {Buffer} buffer - File buffer
   * @param {String} userId - User ID for folder organization
   * @returns {Promise<Object>} Upload result
   */
  async uploadStory(buffer, userId) {
    try {
      const folder = `${CLOUDINARY.UPLOAD_FOLDER}/${CLOUDINARY.STORY_FOLDER}/${userId}`;
      return await this.uploadImage(buffer, folder);
    } catch (error) {
      throw new Error(`Story upload failed: ${error.message}`);
    }
  },

  /**
   * Upload message image
   * @param {Buffer} buffer - File buffer
   * @param {String} userId - User ID for folder organization
   * @returns {Promise<Object>} Upload result
   */
  async uploadMessage(buffer, userId) {
    try {
      const folder = `${CLOUDINARY.UPLOAD_FOLDER}/${CLOUDINARY.MESSAGE_FOLDER}/${userId}`;
      return await this.uploadImage(buffer, folder);
    } catch (error) {
      throw new Error(`Message upload failed: ${error.message}`);
    }
  },

  /**
   * Delete image by public_id
   * @param {String} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  },

  /**
   * Get image URL with transformations
   * @param {String} publicId - Cloudinary public ID
   * @param {Object} options - Transformation options
   * @returns {String} Transformed image URL
   */
  getImageUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
      secure: true,
      quality: CLOUDINARY.QUALITY,
      fetch_format: CLOUDINARY.FETCH_FORMAT,
      ...options,
    });
  },

  /**
   * Get thumbnail URL
   * @param {String} publicId - Cloudinary public ID
   * @param {Number} width - Width in pixels
   * @param {Number} height - Height in pixels
   * @returns {String} Thumbnail URL
   */
  getThumbnail(publicId, width = 200, height = 200) {
    return cloudinary.url(publicId, {
      secure: true,
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    });
  },

  /**
   * Get avatar thumbnail URL
   * @param {String} publicId - Cloudinary public ID
   * @returns {String} Avatar thumbnail URL
   */
  getAvatarUrl(publicId) {
    return this.getThumbnail(publicId, 100, 100);
  },

  /**
   * Extract public ID from Cloudinary URL
   * @param {String} url - Cloudinary URL
   * @returns {String} Public ID
   */
  extractPublicId(url) {
    if (!url) return null;
    const match = url.match(/\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
    if (match) {
      return `${match[1]}/${match[2]}/${match[3]}`;
    }
    return null;
  },

  /**
   * Check if URL is valid Cloudinary URL
   * @param {String} url - URL to check
   * @returns {Boolean}
   */
  isCloudinaryUrl(url) {
    return url && url.includes('cloudinary.com');
  },
};

export default CloudinaryService;
