// src/controllers/messageController.js - Messages Controller

import {
  MessagesService,
  UsersService,
  NotificationsService,
} from '../services/prismaService.js';
import { CloudinaryService } from '../services/cloudinaryService.js';
import { Errors } from '../middleware/errorHandler.js';
import { MESSAGES, NOTIFICATION_TYPES } from '../utils/constants.js';
import { getPaginationParams } from '../middleware/validation.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// SEND MESSAGE CONTROLLER
// ============================================

export async function sendMessage(request, reply) {
  const senderId = request.user.sub;
  const { recipientId, content, image } = request.body;

  if (!recipientId) {
    throw Errors.VALIDATION('Recipient ID is required');
  }

  if (!content && !image) {
    throw Errors.VALIDATION('Message content or image is required');
  }

  // Verify recipient exists
  const recipient = await UsersService.getProfile(recipientId);
  if (!recipient) {
    throw Errors.NOT_FOUND('Recipient');
  }

  // Prevent self-messages
  if (senderId === recipientId) {
    throw Errors.VALIDATION(MESSAGES.CANNOT_MESSAGE_SELF);
  }

  // Create message
  const message = await MessagesService.create(
    senderId,
    recipientId,
    content || null,
    image || null
  );

  // Create notification for recipient
  await NotificationsService.create(
    recipientId,
    NOTIFICATION_TYPES.MESSAGE,
    `${request.user.username} sent you a message`,
    senderId
  );

  reply.status(201).send({
    statusCode: 201,
    message: MESSAGES.MESSAGE_SENT,
    data: message,
  });
}

// ============================================
// GET ALL CONVERSATIONS CONTROLLER
// ============================================

export async function getConversations(request, reply) {
  const userId = request.user.sub;

  const conversations = await MessagesService.getConversations(userId);

  reply.send({
    statusCode: 200,
    message: 'Conversations retrieved',
    conversations,
    total: conversations.length,
  });
}

// ============================================
// GET CONVERSATION MESSAGES CONTROLLER
// ============================================

export async function getConversation(request, reply) {
  const userId = request.user.sub;
  const { conversationId } = request.params;
  const { page, limit } = getPaginationParams(request.query);

  // Verify user is part of conversation
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw Errors.NOT_FOUND('Conversation');
  }

  if (
    conversation.participant1Id !== userId &&
    conversation.participant2Id !== userId
  ) {
    throw Errors.FORBIDDEN();
  }

  const messagesData = await MessagesService.getConversation(
    conversationId,
    page,
    limit
  );

  reply.send({
    statusCode: 200,
    message: 'Messages retrieved',
    data: messagesData,
  });
}

// ============================================
// GET MESSAGES WITH SPECIFIC USER CONTROLLER
// ============================================

export async function getMessagesWithUser(request, reply) {
  const currentUserId = request.user.sub;
  const { userId } = request.params;
  const { page, limit } = getPaginationParams(request.query);

  // Verify user exists
  const user = await UsersService.getProfile(userId);
  if (!user) {
    throw Errors.NOT_FOUND('User');
  }

  // Prevent self-messages
  if (currentUserId === userId) {
    throw Errors.VALIDATION(MESSAGES.CANNOT_MESSAGE_SELF);
  }

  // Find conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        {
          AND: [
            { participant1Id: currentUserId },
            { participant2Id: userId },
          ],
        },
        {
          AND: [
            { participant1Id: userId },
            { participant2Id: currentUserId },
          ],
        },
      ],
    },
  });

  if (!conversation) {
    // No messages yet, return empty
    return reply.send({
      statusCode: 200,
      message: 'No messages yet',
      data: {
        messages: [],
        total: 0,
        page,
        limit,
      },
    });
  }

  const messagesData = await MessagesService.getConversation(
    conversation.id,
    page,
    limit
  );

  reply.send({
    statusCode: 200,
    message: 'Messages retrieved',
    data: messagesData,
  });
}

// ============================================
// MARK MESSAGE AS READ CONTROLLER
// ============================================

export async function markAsRead(request, reply) {
  const { messageId } = request.params;
  const userId = request.user.sub;

  // Verify message exists and user is recipient
  const message = await MessagesService.getById(messageId);

  if (!message) {
    throw Errors.NOT_FOUND('Message');
  }

  if (message.recipientId !== userId) {
    throw Errors.FORBIDDEN();
  }

  const updatedMessage = await MessagesService.markAsRead(messageId);

  reply.send({
    statusCode: 200,
    message: MESSAGES.MESSAGE_READ,
    data: updatedMessage,
  });
}

// ============================================
// DELETE MESSAGE CONTROLLER
// ============================================

export async function deleteMessage(request, reply) {
  const { messageId } = request.params;
  const userId = request.user.sub;

  // Verify message exists and user is sender
  const message = await MessagesService.getById(messageId);

  if (!message) {
    throw Errors.NOT_FOUND('Message');
  }

  if (message.senderId !== userId) {
    throw Errors.FORBIDDEN();
  }

  // Delete image from Cloudinary if it exists
  if (message.image && CloudinaryService.isCloudinaryUrl(message.image)) {
    const publicId = CloudinaryService.extractPublicId(message.image);
    if (publicId) {
      try {
        await CloudinaryService.deleteImage(publicId);
      } catch (err) {
        console.error('Failed to delete image from Cloudinary:', err);
        // Continue with message deletion even if image delete fails
      }
    }
  }

  await MessagesService.delete(messageId);

  reply.send({
    statusCode: 200,
    message: MESSAGES.MESSAGE_DELETED,
  });
}

// ============================================
// EXPORT ALL CONTROLLERS
// ============================================

export default {
  sendMessage,
  getConversations,
  getConversation,
  getMessagesWithUser,
  markAsRead,
  deleteMessage,
};
