// src/routes/notifications.js - Notifications Routes

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadNotifications,
  getNotificationsByType,
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

export default async function notificationRoutes(fastify) {
  // ============================================
  // GET /notifications
  // ============================================
  fastify.get(
    '/',
    { preHandler: authenticateToken },
    getNotifications
  );

  // ============================================
  // GET /notifications/unread/count
  // ============================================
  fastify.get(
    '/unread/count',
    { preHandler: authenticateToken },
    getUnreadCount
  );

  // ============================================
  // GET /notifications/unread
  // ============================================
  fastify.get(
    '/unread',
    { preHandler: authenticateToken },
    getUnreadNotifications
  );

  // ============================================
  // GET /notifications/type/:type
  // ============================================
  fastify.get(
    '/type/:type',
    { preHandler: authenticateToken },
    getNotificationsByType
  );

  // ============================================
  // PUT /notifications/:notificationId/read
  // ============================================
  fastify.put(
    '/:notificationId/read',
    { preHandler: authenticateToken },
    markAsRead
  );

  // ============================================
  // PUT /notifications/read-all
  // ============================================
  fastify.put(
    '/read-all',
    { preHandler: authenticateToken },
    markAllAsRead
  );

  // ============================================
  // DELETE /notifications/:notificationId
  // ============================================
  fastify.delete(
    '/:notificationId',
    { preHandler: authenticateToken },
    deleteNotification
  );
}
