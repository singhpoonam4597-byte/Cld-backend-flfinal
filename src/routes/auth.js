// src/routes/auth.js - Authentication Routes

import {
  signup,
  login,
  getCurrentUser,
  changePassword,
  logout,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { authSchemas } from '../middleware/validation.js';

export default async function authRoutes(fastify) {
  // ============================================
  // POST /auth/signup
  // ============================================
  fastify.post('/signup', async (request, reply) => {
    await validateRequest(authSchemas.signup)(request, reply);
    return signup(request, reply);
  });

  // ============================================
  // POST /auth/login
  // ============================================
  fastify.post('/login', async (request, reply) => {
    await validateRequest(authSchemas.login)(request, reply);
    return login(request, reply);
  });

  // ============================================
  // GET /auth/me
  // ============================================
  fastify.get('/me', { preHandler: authenticateToken }, getCurrentUser);

  // ============================================
  // PUT /auth/change-password
  // ============================================
  fastify.put(
    '/change-password',
    { preHandler: authenticateToken },
    async (request, reply) => {
      await validateRequest(authSchemas.changePassword)(request, reply);
      return changePassword(request, reply);
    }
  );

  // ============================================
  // POST /auth/logout
  // ============================================
  fastify.post('/logout', { preHandler: authenticateToken }, logout);
}
