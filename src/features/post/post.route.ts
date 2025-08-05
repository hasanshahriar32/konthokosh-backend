import { Router } from 'express';
import validator from './post.validator';
import { validateRequest } from '../../middlewares/validation';
import {
  getAllPosts,
  getOnePost,
  createOnePost,
  updateOnePost,
  deleteOnePost,
  approveOnePost,
  unapproveOnePost,
} from './post.controller';

const postRoutes = Router();

// =========================
// GET /posts
// - Get all posts with pagination and filters
// =========================
postRoutes.get(
  '/posts',
  validateRequest(validator.select),
  getAllPosts
);

// =========================
// GET /posts/:id
// - Get single post by ID
// =========================
postRoutes.get(
  '/posts/:id',
  validateRequest(validator.detail),
  getOnePost
);

// =========================
// POST /posts
// - Create new post
// =========================
postRoutes.post(
  '/posts',
  validateRequest(validator.create),
  createOnePost
);

// =========================
// PUT /posts/:id
// - Update existing post
// =========================
postRoutes.put(
  '/posts/:id',
  validateRequest(validator.update),
  updateOnePost
);

// =========================
// DELETE /posts/:id
// - Delete post (hard delete)
// =========================
postRoutes.delete(
  '/posts/:id',
  validateRequest(validator.delete),
  deleteOnePost
);

// =========================
// PATCH /posts/:id/approve
// - Approve a post
// =========================
postRoutes.patch(
  '/posts/:id/approve',
  validateRequest(validator.approve),
  approveOnePost
);

// =========================
// PATCH /posts/:id/unapprove
// - Unapprove a post
// =========================
postRoutes.patch(
  '/posts/:id/unapprove',
  validateRequest(validator.unapprove),
  unapproveOnePost
);

export default postRoutes;
