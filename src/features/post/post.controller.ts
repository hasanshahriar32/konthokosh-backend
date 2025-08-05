import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getAuthenticatedUserId } from '../../utils/auth';
import * as postService from './post.service';

// GET /posts - Get all posts with pagination and filters
export const getAllPosts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = await getAuthenticatedUserId(req, next);
  const filters = { ...req.query } as any;
  
  // If 'myPosts' query parameter is true, filter by current user and show all their posts (approved + unapproved)
  if (filters.myPosts === 'true') {
    filters.userId = userId;
    // When viewing own posts, remove any isApproved filter to show all posts
    delete filters.isApproved;
  }
  // If a specific userId is provided but myPosts is not true, respect the provided userId
  // (This allows filtering by any user's posts, not just the authenticated user's)
  
  const result = await postService.getPosts(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Posts retrieved successfully',
    data: result,
  });
});

// GET /posts/:id - Get single post by ID
export const getOnePost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const post = await postService.getPost(id);

  if (!post) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'Post not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post retrieved successfully',
    data: post,
  });
});

// POST /posts - Create new post
export const createOnePost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = await getAuthenticatedUserId(req, next);
  const postData = { ...req.body, userId };
  
  const createdPost = await postService.createPost(postData);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Post created successfully',
    data: createdPost,
  });
});

// PUT /posts/:id - Update existing post
export const updateOnePost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = await getAuthenticatedUserId(req, next);
  const updateData = req.body;

  // Check if post exists and belongs to the user
  const existingPost = await postService.getPost(id);
  if (!existingPost) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'Post not found',
      data: null,
    });
  }

  // Check if the post belongs to the authenticated user
  if (existingPost.userId !== userId) {
    return sendResponse(res, {
      statusCode: 403,
      success: false,
      message: 'You can only update your own posts',
      data: null,
    });
  }

  const updatedPost = await postService.updatePost({ id, data: updateData });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post updated successfully',
    data: updatedPost,
  });
});

// DELETE /posts/:id - Delete post (soft delete)
export const deleteOnePost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = await getAuthenticatedUserId(req, next);

  // Check if post exists and belongs to the user
  const existingPost = await postService.getPost(id);
  if (!existingPost) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'Post not found',
      data: null,
    });
  }

  // Check if the post belongs to the authenticated user
  if (existingPost.userId !== userId) {
    return sendResponse(res, {
      statusCode: 403,
      success: false,
      message: 'You can only delete your own posts',
      data: null,
    });
  }

  const deletedPost = await postService.deletePost(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post deleted successfully',
    data: deletedPost,
  });
});

// POST /posts/:id/approve - Approve post
export const approveOnePost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  // Check if post exists
  const existingPost = await postService.getPost(id);
  if (!existingPost) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'Post not found',
      data: null,
    });
  }

  const approvedPost = await postService.approvePost(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post approved successfully',
    data: approvedPost,
  });
});

// POST /posts/:id/unapprove - Unapprove post
export const unapproveOnePost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  // Check if post exists
  const existingPost = await postService.getPost(id);
  if (!existingPost) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'Post not found',
      data: null,
    });
  }

  const unapprovedPost = await postService.unapprovePost(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post unapproved successfully',
    data: unapprovedPost,
  });
});
