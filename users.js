// src/routes/users.js - Users Routes

import {
  searchUsers,
  getUserProfile,
  getMyProfile,
  updateProfile,
  getUserPosts,
  getUserById,
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

export default async function userRoutes(fastify) {
  // ============================================
  // GET /users/search
  // ============================================
  fastify.get('/search', searchUsers);

  // ============================================
  // GET /users/me/profile
  // ============================================
  fastify.get('/me/profile', { preHandler: authenticateToken }, getMyProfile);

  // ============================================
  // PUT /users/me/profile
  // ============================================
  fastify.put(
    '/me/profile',
    { preHandler: authenticateToken },
    updateProfile
  );

  // ============================================
  // GET /users/:username
  // ============================================
  fastify.get('/:username', getUserProfile);

  // ============================================
  // GET /users/:username/posts
  // ============================================
  fastify.get('/:username/posts', getUserPosts);

  // ============================================
  // GET /users/by-id/:userId
  // ============================================
  fastify.get('/by-id/:userId', getUserById);
}
