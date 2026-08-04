// src/routes/follows.js - Follows Routes

import {
  toggleFollow,
  getFollowers,
  getFollowing,
  checkFollowing,
  getFollowerCount,
  getFollowingCount,
} from '../controllers/followController.js';
import { authenticateToken } from '../middleware/auth.js';

export default async function followRoutes(fastify) {
  // ============================================
  // POST /follows/:userId/toggle
  // ============================================
  fastify.post(
    '/:userId/toggle',
    { preHandler: authenticateToken },
    toggleFollow
  );

  // ============================================
  // GET /follows/:userId/check
  // ============================================
  fastify.get(
    '/:userId/check',
    { preHandler: authenticateToken },
    checkFollowing
  );

  // ============================================
  // GET /follows/:userId/followers
  // ============================================
  fastify.get('/:userId/followers', getFollowers);

  // ============================================
  // GET /follows/:userId/following
  // ============================================
  fastify.get('/:userId/following', getFollowing);

  // ============================================
  // GET /follows/:userId/followers/count
  // ============================================
  fastify.get('/:userId/followers/count', getFollowerCount);

  // ============================================
  // GET /follows/:userId/following/count
  // ============================================
  fastify.get('/:userId/following/count', getFollowingCount);
}
