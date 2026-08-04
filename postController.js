// src/controllers/postController.js - Posts Controller

import {
  PostsService,
  LikesService,
  CommentsService,
  NotificationsService,
} from '../services/prismaService.js';
import { CloudinaryService } from '../services/cloudinaryService.js';
import { Errors } from '../middleware/errorHandler.js';
import { MESSAGES, NOTIFICATION_TYPES } from '../utils/constants.js';
import { getPaginationParams } from '../middleware/validation.js';

// ============================================
// CREATE POST CONTROLLER
// ============================================

export async function createPost(request, reply) {
  const userId = request.user.sub;
  const data = await request.file();

  if (!data) {
    throw Errors.VALIDATION('Missing content or image');
  }

  const fields = {};
  let imageBuffer = null;
  let fileName = null;

  // Extract fields and file from multipart
  for await (const part of data) {
    if (part.type === 'field') {
      fields[part.fieldname] = part.value;
    } else if (part.type === 'file') {
      imageBuffer = await part.toBuffer();
      fileName = part.filename;
    }
  }

  const { content } = fields;

  if (!content || !content.trim()) {
    throw Errors.VALIDATION('Content is required');
  }

  // Upload image to Cloudinary if provided
  let imageUrl = null;
  if (imageBuffer) {
    try {
      const result = await CloudinaryService.uploadPost(imageBuffer, userId);
      imageUrl = result.secure_url;
    } catch (err) {
      throw Errors.INTERNAL_ERROR('Failed to upload image');
    }
  }

  // Create post in database
  const post = await PostsService.create(userId, content.trim(), imageUrl);

  reply.status(201).send({
    statusCode: 201,
    message: MESSAGES.POST_CREATED,
    post,
  });
}

// ============================================
// GET FEED CONTROLLER
// ============================================

export async function getFeed(request, reply) {
  const { page, limit, skip } = getPaginationParams(request.query);

  const feed = await PostsService.getFeed(page, limit);

  reply.send({
    statusCode: 200,
    message: 'Feed retrieved successfully',
    data: feed,
  });
}

// ============================================
// GET SINGLE POST CONTROLLER
// ============================================

export async function getPost(request, reply) {
  const { id } = request.params;

  const post = await PostsService.getById(id);
  if (!post) {
    throw Errors.NOT_FOUND('Post');
  }

  reply.send({
    statusCode: 200,
    message: MESSAGES.PROFILE_RETRIEVED,
    post,
  });
}

// ============================================
// DELETE POST CONTROLLER
// ============================================

export async function deletePost(request, reply) {
  const { id } = request.params;
  const userId = request.user.sub;

  const post = await PostsService.getById(id);
  if (!post) {
    throw Errors.NOT_FOUND('Post');
  }

  // Verify ownership
  if (post.authorId !== userId) {
    throw Errors.FORBIDDEN();
  }

  // Delete image from Cloudinary if it exists
  if (post.image && CloudinaryService.isCloudinaryUrl(post.image)) {
    const publicId = CloudinaryService.extractPublicId(post.image);
    if (publicId) {
      try {
        await CloudinaryService.deleteImage(publicId);
      } catch (err) {
        console.error('Failed to delete image from Cloudinary:', err);
        // Continue with post deletion even if image delete fails
      }
    }
  }

  await PostsService.delete(id);

  reply.send({
    statusCode: 200,
    message: MESSAGES.POST_DELETED,
  });
}

// ============================================
// LIKE POST CONTROLLER
// ============================================

export async function likePost(request, reply) {
  const { id: postId } = request.params;
  const userId = request.user.sub;

  // Verify post exists
  const post = await PostsService.getById(postId);
  if (!post) {
    throw Errors.NOT_FOUND('Post');
  }

  // Check if already liked
  const alreadyLiked = await LikesService.exists(userId, postId);

  if (alreadyLiked) {
    // Unlike
    await LikesService.delete(userId, postId);
    
    reply.send({
      statusCode: 200,
      message: MESSAGES.POST_UNLIKED,
      liked: false,
    });
  } else {
    // Like
    await LikesService.create(userId, postId);

    // Create notification (only if not the post author)
    if (post.authorId !== userId) {
      await NotificationsService.create(
        post.authorId,
        NOTIFICATION_TYPES.LIKE,
        `${request.user.username} liked your post`,
        userId,
        postId
      );
    }

    reply.status(201).send({
      statusCode: 201,
      message: MESSAGES.POST_LIKED,
      liked: true,
    });
  }
}

// ============================================
// ADD COMMENT CONTROLLER
// ============================================

export async function addComment(request, reply) {
  const { id: postId } = request.params;
  const userId = request.user.sub;
  const { content } = request.body;

  if (!content || !content.trim()) {
    throw Errors.VALIDATION('Comment content is required');
  }

  // Verify post exists
  const post = await PostsService.getById(postId);
  if (!post) {
    throw Errors.NOT_FOUND('Post');
  }

  const comment = await CommentsService.create(userId, postId, content.trim());

  // Create notification (only if not the post author)
  if (post.authorId !== userId) {
    await NotificationsService.create(
      post.authorId,
      NOTIFICATION_TYPES.COMMENT,
      `${request.user.username} commented on your post`,
      userId,
      postId
    );
  }

  reply.status(201).send({
    statusCode: 201,
    message: MESSAGES.COMMENT_ADDED,
    comment,
  });
}

// ============================================
// GET POST COMMENTS CONTROLLER
// ============================================

export async function getPostComments(request, reply) {
  const { id: postId } = request.params;

  const post = await PostsService.getById(postId);
  if (!post) {
    throw Errors.NOT_FOUND('Post');
  }

  const comments = await CommentsService.getByPostId(postId);

  reply.send({
    statusCode: 200,
    message: 'Comments retrieved successfully',
    comments,
    total: comments.length,
  });
}

// ============================================
// DELETE COMMENT CONTROLLER
// ============================================

export async function deleteComment(request, reply) {
  const { commentId } = request.params;
  const userId = request.user.sub;

  // Get comment to verify ownership
  const comment = await CommentsService.getById(commentId);

  if (!comment) {
    throw Errors.NOT_FOUND('Comment');
  }

  if (comment.userId !== userId) {
    throw Errors.FORBIDDEN();
  }

  await CommentsService.delete(commentId);

  reply.send({
    statusCode: 200,
    message: MESSAGES.COMMENT_DELETED,
  });
}

// ============================================
// EXPORT ALL CONTROLLERS
// ============================================

export default {
  createPost,
  getFeed,
  getPost,
  deletePost,
  likePost,
  addComment,
  getPostComments,
  deleteComment,
};
