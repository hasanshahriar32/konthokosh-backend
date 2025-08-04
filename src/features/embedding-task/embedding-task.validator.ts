import Joi from 'joi';

// Validation schema for creating an embedding task
export const createEmbeddingTaskSchema = Joi.object({
  projectId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Project ID must be a number',
      'number.integer': 'Project ID must be an integer',  
      'number.positive': 'Project ID must be positive',
      'any.required': 'Project ID is required'
    })
});

// Validation schema for pagination query parameters
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
      'any.required': 'Page is required'
    }),
  
  size: Joi.number().integer().min(1).max(100).required()
    .messages({
      'number.base': 'Size must be a number',
      'number.integer': 'Size must be an integer',
      'number.min': 'Size must be at least 1',
      'number.max': 'Size cannot exceed 100',
      'any.required': 'Size is required'
    }),
  
  keyword: Joi.string().trim().min(1).max(100).optional()
    .messages({
      'string.base': 'Keyword must be a string',
      'string.min': 'Keyword must have at least 1 character',
      'string.max': 'Keyword cannot exceed 100 characters'
    }),
  
  sort: Joi.string().valid('createdAt', 'updatedAt', 'status', 'taskId').optional()
    .messages({
      'string.base': 'Sort field must be a string',
      'any.only': 'Sort field must be one of: createdAt, updatedAt, status, taskId'
    }),
  
  order: Joi.string().valid('asc', 'desc').optional()
    .messages({
      'string.base': 'Order must be a string',
      'any.only': 'Order must be either asc or desc'
    })
});

// Validation schema for webhook status updates
export const webhookUpdateSchema = Joi.object({
  pdfUrl: Joi.string().uri().required()
    .messages({
      'string.base': 'PDF URL must be a string',
      'string.uri': 'PDF URL must be a valid URL',
      'any.required': 'PDF URL is required'
    }),
  
  status: Joi.string().valid('success', 'failed').required()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be either "success" or "failed"',
      'any.required': 'Status is required'
    }),
  
  errorMessage: Joi.string().trim().max(1000).optional()
    .messages({
      'string.base': 'Error message must be a string',
      'string.max': 'Error message cannot exceed 1000 characters'
    }),
  
  message: Joi.string().trim().max(500).optional()
    .messages({
      'string.base': 'Message must be a string',
      'string.max': 'Message cannot exceed 500 characters'
    })
});

// Validation schema for task ID parameter
export const taskIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Task ID must be a number',
      'number.integer': 'Task ID must be an integer',
      'number.positive': 'Task ID must be positive',
      'any.required': 'Task ID is required'
    })
});

// Validation schema for project ID parameter  
export const projectIdParamSchema = Joi.object({
  projectId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Project ID must be a number',
      'number.integer': 'Project ID must be an integer',
      'number.positive': 'Project ID must be positive',
      'any.required': 'Project ID is required'
    })
});
