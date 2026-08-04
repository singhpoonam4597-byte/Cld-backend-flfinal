// src/controllers/notificationController.js - Notifications Controller

import {
  NotificationsService,
  UsersService,
} from '../services/prismaService.js';
import { Errors } from '../middleware/errorHandler.js';
import { MESSAGES } from '../utils/constants.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// GET MY NOTIFICATIONS CONTROLLER
// ============================================

export async function getNotifications(request, reply) {
  const userId = request.user.sub;
  const limit = request.query.limit ? parseInt(request.query.limit) : 20;

  if (limit < 1 || limit > 100) {
    throw Errors.VALIDATION('Limit must be between 1 and 100');
  }

  const notifications = await NotificationsService.getByUserId(userId, limit);

  reply.send({
    statusCode: 200,
    message: 'Notifications retrieved',
    notifications,
    total: notifications.length,
  });
}

// ============================================
// GET UNREAD COUNT CONTROLLER
// ============================================

export async function getUnreadCount(request, reply) {
  const userId = request.user.sub;

  const count = await NotificationsService.getUnreadCount(userId);

  reply.send({
    statusCode: 200,
    unreadCount: count,
  });
}

// ============================================
// MARK NOTIFICATION AS READ CONTROLLER
// ============================================

export async function markAsRead(request, reply) {
  const { notificationId } = request.params;
  const userId = request.user.sub;

  // Verify notification belongs to user
  const notification = await NotificationsService.getById(notificationId);

  if (!notification) {
    throw Errors.NOT_FOUND('Notification');
  }

  if (notification.userId !== userId) {
    throw Errors.FORBIDDEN();
  }

  const updated = await NotificationsService.markAsRead(notificationId);

  reply.send({
    statusCode: 200,
    message: MESSAGES.NOTIFICATION_READ,
    data: updated,
  });
}

// ============================================
// MARK ALL NOTIFICATIONS AS READ CONTROLLER
// ============================================

export async function markAllAsRead(request, reply) {
  const userId = request.user.sub;

  await NotificationsService.markAllAsRead(userId);

  reply.send({
    statusCode: 200,
    message: MESSAGES.ALL_NOTIFICATIONS_READ,
  });
}

// ============================================
// DELETE NOTIFICATION CONTROLLER
// ============================================

export async function deleteNotification(request, reply) {
  const { notificationId } = request.params;
  const userId = request.user.sub;

  const notification = await NotificationsService.getById(notificationId);

  if (!notification) {
    throw Errors.NOT_FOUND('Notification');
  }

  if (notification.userId !== userId) {
    throw Errors.FORBIDDEN();
  }

  await NotificationsService.delete(notificationId);

  reply.send({
    statusCode: 200,
    message: 'Notification deleted',
  });
}

// ============================================
// GET UNREAD NOTIFICATIONS CONTROLLER
// ============================================

export async function getUnreadNotifications(request, reply) {
  const userId = request.user.sub;
  const limit = request.query.limit ? parseInt(request.query.limit) : 20;

  if (limit < 1 || limit > 100) {
    throw Errors.VALIDATION('Limit must be between 1 and 100');
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  reply.send({
    statusCode: 200,
    message: 'Unread notifications retrieved',
    notifications,
    total: notifications.length,
  });
}

// ============================================
// GET NOTIFICATION BY TYPE CONTROLLER
// ============================================

export async function getNotificationsByType(request, reply) {
  const userId = request.user.sub;
  const { type } = request.params;
  const limit = request.query.limit ? parseInt(request.query.limit) : 20;

  if (limit < 1 || limit > 100) {
    throw Errors.VALIDATION('Limit must be between 1 and 100');
  }

  const validTypes = ['like', 'comment', 'follow', 'message', 'reply'];
  if (!validTypes.includes(type)) {
    throw Errors.VALIDATION(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`);
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      type,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  reply.send({
    statusCode: 200,
    message: `${type} notifications retrieved`,
    type,
    notifications,
    total: notifications.length,
  });
}

// ============================================
// EXPORT ALL CONTROLLERS
// ============================================

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadNotifications,
  getNotificationsByType,
};
