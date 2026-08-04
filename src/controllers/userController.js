// src/controllers/userController.js - Users Controller

import { UsersService, PostsService } from '../services/prismaService.js';
import { CloudinaryService } from '../services/cloudinaryService.js';
import { Errors } from '../middleware/errorHandler.js';
import { MESSAGES } from '../utils/constants.js';
import { getPaginationParams } from '../middleware/validation.js';
import { validateEmail, validateUsername } from '../utils/helpers.js';

// ============================================
// SEARCH USERS CONTROLLER
// ============================================

export async function searchUsers(request, reply) {
  const { q, limit = 10 } = request.query;

  if (!q || q.trim().length < 2) {
    throw Errors.VALIDATION('Search query must be at least 2 characters');
  }

  const users = await UsersService.search(q, parseInt(limit));

  reply.send({
    statusCode: 200,
    message: 'Users found',
    users,
    total: users.length,
  });
}

// ============================================
// GET USER PROFILE CONTROLLER
// ============================================

export async function getUserProfile(request, reply) {
  const { username } = request.params;

  const user = await UsersService.getByUsername(username);
  if (!user) {
    throw Errors.NOT_FOUND('User');
  }

  // Get user's posts (only first 10)
  const { posts, total } = await PostsService.getUserPosts(user.id, 1, 10);

  reply.send({
    statusCode: 200,
    message: MESSAGES.PROFILE_RETRIEVED,
    user: {
      ...user,
      postsPreview: posts,
      postsCount: total,
    },
  });
}

// ============================================
// GET MY PROFILE CONTROLLER
// ============================================

export async function getMyProfile(request, reply) {
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
// UPDATE PROFILE CONTROLLER
// ============================================

export async function updateProfile(request, reply) {
  const userId = request.user.sub;
  const { displayName, bio, isPrivate } = request.body;

  // Handle file upload (avatar)
  let avatar = null;
  const data = await request.file();

  if (data) {
    try {
      let imageBuffer = null;

      for await (const part of data) {
        if (part.type === 'file') {
          imageBuffer = await part.toBuffer();
          break;
        }
      }

      if (imageBuffer) {
        const result = await CloudinaryService.uploadAvatar(imageBuffer, userId);
        avatar = result.secure_url;
      }
    } catch (err) {
      throw Errors.INTERNAL_ERROR('Failed to upload avatar');
    }
  }

  // Prepare update data
  const updateData = {};

  if (displayName) {
    if (displayName.length < 2 || displayName.length > 50) {
      throw Errors.VALIDATION(
        'Display name must be between 2 and 50 characters'
      );
    }
    updateData.displayName = displayName;
  }

  if (bio !== undefined) {
    if (bio && bio.length > 200) {
      throw Errors.VALIDATION('Bio cannot exceed 200 characters');
    }
    updateData.bio = bio || null;
  }

  if (isPrivate !== undefined) {
    updateData.isPrivate = Boolean(isPrivate);
  }

  if (avatar) {
    updateData.avatar = avatar;
  }

  if (Object.keys(updateData).length === 0) {
    throw Errors.VALIDATION('No fields to update');
  }

  const updatedUser = await UsersService.updateProfile(userId, updateData);

  reply.send({
    statusCode: 200,
    message: MESSAGES.PROFILE_UPDATED,
    user: updatedUser,
  });
}

// ============================================
// GET USER POSTS CONTROLLER
// ============================================

export async function getUserPosts(request, reply) {
  const { username } = request.params;
  const { page, limit } = getPaginationParams(request.query);

  const user = await UsersService.getByUsername(username);
  if (!user) {
    throw Errors.NOT_FOUND('User');
  }

  const postsData = await PostsService.getUserPosts(user.id, page, limit);

  reply.send({
    statusCode: 200,
    message: 'User posts retrieved',
    username,
    data: postsData,
  });
}

// ============================================
// GET USER BY ID CONTROLLER
// ============================================

export async function getUserById(request, reply) {
  const { userId } = request.params;

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
// EXPORT ALL CONTROLLERS
// ============================================

export default {
  searchUsers,
  getUserProfile,
  getMyProfile,
  updateProfile,
  getUserPosts,
  getUserById,
};
