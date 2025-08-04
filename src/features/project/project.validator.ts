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
    body: Joi.object({
      title: Joi.string().trim().min(1).max(255).required(),
      description: Joi.string().trim().min(1).required(),
    }),
  },
  update: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      title: Joi.string().trim().min(1).max(255).optional(),
      description: Joi.string().trim().allow('').optional(),
      searchId: Joi.string().trim().max(255).allow('').optional(),
      pdfList: Joi.array()
        .items(
          Joi.object({
            id: Joi.number().required(),
            searchId: Joi.number().required(),
            title: Joi.string().required(),
            authors: Joi.array().items(Joi.string()).required(),
            abstract: Joi.string().required(),
            year: Joi.number().required(),
            source: Joi.string().required(),
            sourceId: Joi.string().required(),
            url: Joi.string().uri().required(),
            pdfUrl: Joi.string().uri().required(),
            doi: Joi.string().allow(null).optional(),
            citations: Joi.number().required(),
            fileSize: Joi.number().allow(null).optional(),
            pageCount: Joi.number().allow(null).optional(),
            language: Joi.string().required(),
            tags: Joi.array().items(Joi.string()).required(),
            matchScore: Joi.number().required(),
            metadata: Joi.object().required(),
            selected: Joi.boolean().required(),
            createdAt: Joi.string().required(),
          })
        )
        .optional(),
    }).min(1), // At least one field must be provided for update
  },
  delete: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
};

export default validator;
