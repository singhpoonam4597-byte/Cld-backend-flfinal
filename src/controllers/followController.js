// src/controllers/followController.js - Follows Controller

import {
  FollowsService,
  UsersService,
  NotificationsService,
} from '../services/prismaService.js';
import { Errors } from '../middleware/errorHandler.js';
import { MESSAGES, NOTIFICATION_TYPES } from '../utils/constants.js';
import { getPaginationParams } from '../middleware/validation.js';

// ============================================
// TOGGLE FOLLOW CONTROLLER
// ============================================

export async function toggleFollow(request, reply) {
  const followerId = request.user.sub;
  const { userId: followingId } = request.params;

  // Prevent self-follow
  if (followerId === followingId) {
    throw Errors.VALIDATION(MESSAGES.CANNOT_FOLLOW_SELF);
  }

  // Verify target user exists
  const targetUser = await UsersService.getProfile(followingId);
  if (!targetUser) {
    throw Errors.NOT_FOUND('User');
  }

  // Check if already following
  const isFollowing = await FollowsService.exists(followerId, followingId);

  if (isFollowing) {
    // Unfollow
    await FollowsService.delete(followerId, followingId);
    reply.send({
      statusCode: 200,
      message: MESSAGES.USER_UNFOLLOWED,
      following: false,
    });
  } else {
    // Follow
    await FollowsService.create(followerId, followingId);

    // Create notification
    await NotificationsService.create(
      followingId,
      NOTIFICATION_TYPES.FOLLOW,
      `${request.user.username} started following you`,
      followerId
    );

    reply.status(201).send({
      statusCode: 201,
      message: MESSAGES.USER_FOLLOWED,
      following: true,
    });
  }
}

// ============================================
// GET USER FOLLOWERS CONTROLLER
// ============================================

export async function getFollowers(request, reply) {
  const { userId } = request.params;
  const { page, limit } = getPaginationParams(request.query);

  // Verify user exists
  const user = await UsersService.getProfile(userId);
  if (!user) {
    throw Errors.NOT_FOUND('User');
  }

  const followersData = await FollowsService.getFollowers(userId, page, limit);

  reply.send({
    statusCode: 200,
    message: 'Followers retrieved',
    data: followersData,
  });
}

// ============================================
// GET USER FOLLOWING CONTROLLER
// ============================================

export async function getFollowing(request, reply) {
  const { userId } = request.params;
  const { page, limit } = getPaginationParams(request.query);

  // Verify user exists
  const user = await UsersService.getProfile(userId);
  if (!user) {
    throw Errors.NOT_FOUND('User');
  }

  const followingData = await FollowsService.getFollowing(userId, page, limit);

  reply.send({
    statusCode: 200,
    message: 'Following retrieved',
    data: followingData,
  });
}

// ============================================
// CHECK IF FOLLOWING CONTROLLER
// ============================================

export async function checkFollowing(request, reply) {
  const followerId = request.user.sub;
  const { userId: followingId } = request.params;

  // Verify target user exists
  const targetUser = await UsersService.getProfile(followingId);
  if (!targetUser) {
    throw Errors.NOT_FOUND('User');
  }

  const isFollowing = await FollowsService.exists(followerId, followingId);

  reply.send({
    statusCode: 200,
    userId: followingId,
    isFollowing,
  });
}

// ============================================
// GET FOLLOWER COUNT CONTROLLER
// ============================================

export async function getFollowerCount(request, reply) {
  const { userId } = request.params;

  // Verify user exists
  const user = await UsersService.getProfile(userId);
  if (!user) {
    throw Errors.NOT_FOUND('User');
  }

  const count = await FollowsService.getFollowerCount(userId);

  reply.send({
    statusCode: 200,
    userId,
    followerCount: count,
  });
}

// ============================================
// GET FOLLOWING COUNT CONTROLLER
// ============================================

export async function getFollowingCount(request, reply) {
  const { userId } = request.params;

  // Verify user exists
  const user = await UsersService.getProfile(userId);
  if (!user) {
    throw Errors.NOT_FOUND('User');
  }

  const count = await FollowsService.getFollowingCount(userId);

  reply.send({
    statusCode: 200,
    userId,
    followingCount: count,
  });
}

// ============================================
// EXPORT ALL CONTROLLERS
// ============================================

export default {
  toggleFollow,
  getFollowers,
  getFollowing,
  checkFollowing,
  getFollowerCount,
  getFollowingCount,
};
