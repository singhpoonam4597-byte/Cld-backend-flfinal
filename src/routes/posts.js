// src/routes/posts.js - Posts Routes

import {
  createPost,
  getFeed,
  getPost,
  deletePost,
  likePost,
  addComment,
  getPostComments,
  deleteComment,
} from '../controllers/postController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { postSchemas } from '../middleware/validation.js';

export default async function postRoutes(fastify) {
  // ============================================
  // POST /posts
  // ============================================
  fastify.post('/', { preHandler: authenticateToken }, createPost);

  // ============================================
  // GET /posts (Feed)
  // ============================================
  fastify.get('/', getFeed);

  // ============================================
  // GET /posts/:id
  // ============================================
  fastify.get('/:id', getPost);

  // ============================================
  // DELETE /posts/:id
  // ============================================
  fastify.delete('/:id', { preHandler: authenticateToken }, deletePost);

  // ============================================
  // POST /posts/:id/like
  // ============================================
  fastify.post('/:id/like', { preHandler: authenticateToken }, likePost);

  // ============================================
  // POST /posts/:id/comment
  // ============================================
  fastify.post('/:id/comment', { preHandler: authenticateToken }, async (request, reply) => {
    await validateRequest(postSchemas.comment)(request, reply);
    return addComment(request, reply);
  });

  // ============================================
  // GET /posts/:id/comments
  // ============================================
  fastify.get('/:id/comments', getPostComments);

  // ============================================
  // DELETE /posts/comment/:commentId
  // ============================================
  fastify.delete(
    '/comment/:commentId',
    { preHandler: authenticateToken },
    deleteComment
  );
}
