// src/services/prismaService.js - Database Queries Service

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// POSTS SERVICE
// ============================================

export const PostsService = {
  async create(authorId, content, image) {
    return prisma.post.create({
      data: {
        authorId,
        content,
        image,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  },

  async getFeed(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          likes: {
            select: { userId: true },
          },
          comments: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      prisma.post.count(),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  async getById(postId) {
    return prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        likes: {
          select: { userId: true },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  },

  async delete(postId) {
    return prisma.post.delete({
      where: { id: postId },
    });
  },

  async getUserPosts(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          likes: {
            select: { userId: true },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      prisma.post.count({ where: { authorId: userId } }),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },
};

// ============================================
// LIKES SERVICE
// ============================================

export const LikesService = {
  async create(userId, postId) {
    return prisma.like.create({
      data: {
        userId,
        postId,
      },
    });
  },

  async delete(userId, postId) {
    return prisma.like.deleteMany({
      where: {
        userId,
        postId,
      },
    });
  },

  async exists(userId, postId) {
    const like = await prisma.like.findFirst({
      where: {
        userId,
        postId,
      },
    });
    return !!like;
  },

  async count(postId) {
    return prisma.like.count({
      where: { postId },
    });
  },
};

// ============================================
// COMMENTS SERVICE
// ============================================

export const CommentsService = {
  async create(userId, postId, content) {
    return prisma.comment.create({
      data: {
        userId,
        postId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });
  },

  async getByPostId(postId) {
    return prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });
  },

  async getById(commentId) {
    return prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });
  },

  async delete(commentId) {
    return prisma.comment.delete({
      where: { id: commentId },
    });
  },

  async count(postId) {
    return prisma.comment.count({
      where: { postId },
    });
  },
};

// ============================================
// USERS SERVICE
// ============================================

export const UsersService = {
  async create(email, username, displayName, hashedPassword) {
    return prisma.user.create({
      data: {
        email,
        username,
        displayName,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        createdAt: true,
      },
    });
  },

  async getProfile(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatar: true,
        bio: true,
        isPrivate: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });
  },

  async getByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async getByUsername(username) {
    return prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        isPrivate: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });
  },

  async search(query, limit = 10) {
    return prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        isVerified: true,
      },
    });
  },

  async updateProfile(userId, data) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatar: true,
        bio: true,
        isPrivate: true,
      },
    });
  },

  async updatePassword(userId, hashedPassword) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  },

  async getById(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  },
};

// ============================================
// FOLLOWS SERVICE
// ============================================

export const FollowsService = {
  async create(followerId, followingId) {
    return prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
  },

  async delete(followerId, followingId) {
    return prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });
  },

  async exists(followerId, followingId) {
    const follow = await prisma.follow.findFirst({
      where: {
        followerId,
        followingId,
      },
    });
    return !!follow;
  },

  async getFollowers(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        select: {
          follower: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              isVerified: true,
            },
          },
        },
      }),
      prisma.follow.count({ where: { followingId: userId } }),
    ]);

    return {
      followers: followers.map((f) => f.follower),
      total,
      page,
      limit,
    };
  },

  async getFollowing(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        select: {
          following: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              isVerified: true,
            },
          },
        },
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      following: following.map((f) => f.following),
      total,
      page,
      limit,
    };
  },

  async getFollowerCount(userId) {
    return prisma.follow.count({
      where: { followingId: userId },
    });
  },

  async getFollowingCount(userId) {
    return prisma.follow.count({
      where: { followerId: userId },
    });
  },
};

// ============================================
// MESSAGES SERVICE
// ============================================

export const MessagesService = {
  async create(senderId, recipientId, content, image = null) {
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { AND: [{ participant1Id: senderId }, { participant2Id: recipientId }] },
          { AND: [{ participant1Id: recipientId }, { participant2Id: senderId }] },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: senderId,
          participant2Id: recipientId,
        },
      });
    }

    return prisma.message.create({
      data: {
        senderId,
        recipientId,
        conversationId: conversation.id,
        content,
        image,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });
  },

  async getConversation(conversationId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    return {
      messages,
      total,
      page,
      limit,
    };
  },

  async getConversations(userId) {
    return prisma.conversation.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        participant1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        participant2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
  },

  async markAsRead(messageId) {
    return prisma.message.update({
      where: { id: messageId },
      data: { read: true },
    });
  },

  async getById(messageId) {
    return prisma.message.findUnique({
      where: { id: messageId },
    });
  },

  async delete(messageId) {
    return prisma.message.delete({
      where: { id: messageId },
    });
  },
};

// ============================================
// NOTIFICATIONS SERVICE
// ============================================

export const NotificationsService = {
  async create(userId, type, message, relatedUserId = null, postId = null) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        message,
        relatedUserId,
        postId,
      },
    });
  },

  async getByUserId(userId, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  async getById(notificationId) {
    return prisma.notification.findUnique({
      where: { id: notificationId },
    });
  },

  async markAsRead(notificationId) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  },

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId },
      data: { read: true },
    });
  },

  async getUnreadCount(userId) {
    return prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  },

  async delete(notificationId) {
    return prisma.notification.delete({
      where: { id: notificationId },
    });
  },
};

export default {
  prisma,
  PostsService,
  LikesService,
  CommentsService,
  UsersService,
  FollowsService,
  MessagesService,
  NotificationsService,
};
