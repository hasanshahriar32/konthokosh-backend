import Joi from 'joi';

const validator = {
  select: {
    query: Joi.object({
      keyword: Joi.string().allow('').optional(),
      size: Joi.number().required(),
      page: Joi.number().required(),
      sort: Joi.string().optional(),
      order: Joi.string().valid('asc', 'desc').optional(),
      channel_id: Joi.string().optional(),
      module_id: Joi.string().optional(),
    }),
  },
  detail: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  create: {
    body: Joi.object({
      name: Joi.string().required(),
      channel_id: Joi.string().required(),
      module_id: Joi.string().required(),
    }),
  },
  createMulti: {
    body: Joi.object({
      subModules: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          channel_id: Joi.string().required(),
          module_id: Joi.string().required(),
        })
      ),
    }),
  },
  update: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      name: Joi.string().required(),
      channel_id: Joi.string().required(),
      module_id: Joi.string().required(),
    }),
  },
  delete: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  deleteMulti: {
    body: Joi.object({
      ids: Joi.array().items(Joi.string().required()),
    }),
  },
} as const;

export default validator;
