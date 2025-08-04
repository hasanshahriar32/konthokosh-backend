import Joi from 'joi';

const validator = {
  login: {
    body: Joi.object({
      username: Joi.string().trim().required(),
      password: Joi.string().trim().min(6).required(),
    }),
  },
} as const;

export default validator;
