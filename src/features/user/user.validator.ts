import Joi from 'joi';

const validator = {
  select: {
    query: Joi.object({
      keyword: Joi.string().allow('').optional(),
      size: Joi.number().required(),
      page: Joi.number().required(),
      sort: Joi.string().optional(),
      order: Joi.string().valid('asc', 'desc').optional(),
    }),
  },
  detail: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  create: {
    // For Clerk-based user creation, no body fields are required
    body: Joi.object({}).optional(),
  },
  update: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      username: Joi.string().trim().required(),
      first_name: Joi.string().trim().required(),
      last_name: Joi.string().trim().required(),
      email: Joi.string().trim().email().required(),
      phone1: Joi.string().trim().required(),
      phone2: Joi.string().trim().allow('').optional(),
      phone3: Joi.string().trim().allow('').optional(),
      password: Joi.string().trim().min(6).required(),
      address1: Joi.string().trim().required(),
      address2: Joi.string().trim().allow('').optional(),
    }),
  },
  delete: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
} as const;

export default validator;
