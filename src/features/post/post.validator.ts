import Joi from 'joi';

const postValidator = {
  // GET /posts - List posts with pagination and filters
  select: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      size: Joi.number().integer().min(1).max(100).default(10),
      keyword: Joi.string().trim().max(100),
      isApproved: Joi.boolean(),
      userId: Joi.number().integer().min(1),
      myPosts: Joi.boolean().default(false),
    }),
  },

  // GET /posts/:id - Get single post by ID
  detail: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }),
  },

  // POST /posts - Create new post
  create: {
    body: Joi.object({
      post: Joi.string().trim().min(1).max(5000).required(),
      imagesId: Joi.array().items(Joi.string()).default([]),
      isApproved: Joi.boolean().default(false),
    }),
  },

  // PUT /posts/:id - Update post
  update: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }),
    body: Joi.object({
      post: Joi.string().trim().min(1).max(5000),
      imagesId: Joi.array().items(Joi.string()),
      isApproved: Joi.boolean(),
      isActive: Joi.boolean(),
    }),
  },

  // DELETE /posts/:id - Delete post
  delete: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }),
  },

  // POST /posts/:id/approve - Approve post
  approve: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }),
  },

  // POST /posts/:id/unapprove - Unapprove post
  unapprove: {
    params: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }),
  },
};

export default postValidator;
