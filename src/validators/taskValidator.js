const Joi = require('joi');
const { TASK_STATUS, TASK_STATUS_VALUES } = require('../constants/taskStatus');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const taskIdParamSchema = {
  params: Joi.object({
    id: Joi.string().regex(objectIdPattern).required().messages({
      'string.base': 'Task ID must be a string',
      'string.empty': 'Task ID cannot be empty',
      'string.pattern.base': 'Invalid task ID format. Must be a 24-character hexadecimal ObjectId',
      'any.required': 'Task ID is required in URL parameters',
    }),
  }),
};

const createTaskSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(1).max(100).required().messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Title is required',
    }),
    description: Joi.string().allow('').max(1000).default('').messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description cannot exceed 1000 characters',
    }),
    status: Joi.string()
      .valid(...TASK_STATUS_VALUES)
      .default(TASK_STATUS.PENDING)
      .messages({
        'any.only': `Status must be one of: ${TASK_STATUS_VALUES.join(', ')}`,
      }),
  }),
};

const updateTaskSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(1).max(100).messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 100 characters',
    }),
    description: Joi.string().allow('').max(1000).messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description cannot exceed 1000 characters',
    }),
    status: Joi.string()
      .valid(...TASK_STATUS_VALUES)
      .messages({
        'any.only': `Status must be one of: ${TASK_STATUS_VALUES.join(', ')}`,
      }),
  })
    .min(1)
    .messages({
      'object.min': 'At least one field (title, description, or status) must be provided for update',
    }),
};

const getTasksQuerySchema = {
  query: Joi.object({
    status: Joi.string()
      .valid(...TASK_STATUS_VALUES)
      .messages({
        'any.only': `Status filter must be one of: ${TASK_STATUS_VALUES.join(', ')}`,
      }),
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a valid integer',
      'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': 'Limit must be a valid integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  }),
};

module.exports = {
  taskIdParamSchema,
  createTaskSchema,
  updateTaskSchema,
  getTasksQuerySchema,
};
