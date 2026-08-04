// src/routes/messages.js - Messages Routes

import {
  sendMessage,
  getConversations,
  getConversation,
  getMessagesWithUser,
  markAsRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { messageSchemas } from '../middleware/validation.js';

export default async function messageRoutes(fastify) {
  // ============================================
  // POST /messages
  // ============================================
  fastify.post('/', { preHandler: authenticateToken }, async (request, reply) => {
    await validateRequest(messageSchemas.send)(request, reply);
    return sendMessage(request, reply);
  });

  // ============================================
  // GET /messages/conversations
  // ============================================
  fastify.get(
    '/conversations',
    { preHandler: authenticateToken },
    getConversations
  );

  // ============================================
  // GET /messages/:conversationId
  // ============================================
  fastify.get(
    '/:conversationId',
    { preHandler: authenticateToken },
    getConversation
  );

  // ============================================
  // GET /messages/user/:userId
  // ============================================
  fastify.get(
    '/user/:userId',
    { preHandler: authenticateToken },
    getMessagesWithUser
  );

  // ============================================
  // PUT /messages/:messageId/read
  // ============================================
  fastify.put(
    '/:messageId/read',
    { preHandler: authenticateToken },
    markAsRead
  );

  // ============================================
  // DELETE /messages/:messageId
  // ============================================
  fastify.delete(
    '/:messageId',
    { preHandler: authenticateToken },
    deleteMessage
  );
}
