import Joi from 'joi';

const validator = {
  select: {
    query: Joi.object({
      user_id: Joi.string().optional(),
      role_id: Joi.string().optional(),
    }),
  },
  detail: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  create: {
    body: Joi.object({
      channel_id: Joi.string().required(),
      module_id: Joi.string().required(),
      sub_module_id: Joi.string().required(),
      role_id: Joi.string().required(),
      action_id: Joi.string().required(),
    }),
  },
  update: {
    body: Joi.object({
      role_id: Joi.string().required(),
      channel_id: Joi.string().required(),
      permissions: Joi.array()
        .items(
          Joi.object({
            module_id: Joi.string().required(),
            sub_module_id: Joi.string().required(),
            channel_id: Joi.string().required(),
            actions: Joi.array().items(Joi.string()).required(),
          })
        )
        .required(),
    }),
  },
  delete: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
} as const;

export default validator;
