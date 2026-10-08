const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../config/env');
const { TASK_STATUS_VALUES } = require('../constants/taskStatus');

const prodServerUrl = process.env.RENDER_EXTERNAL_URL || 'https://task-api-zvh4.onrender.com';
const localServerUrl = `http://localhost:${config.PORT || 5000}`;

const servers =
  config.NODE_ENV === 'production'
    ? [
        {
          url: prodServerUrl,
          description: 'Production Server (Render)',
        },
        {
          url: localServerUrl,
          description: 'Local Development Server',
        },
      ]
    : [
        {
          url: localServerUrl,
          description: 'Local Development Server',
        },
        {
          url: prodServerUrl,
          description: 'Production Server (Render)',
        },
      ];

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Task Management RESTful API',
    version: '1.0.0',
    description:
      'A secure, production-quality RESTful API for task management featuring JWT authentication, user-scoped task ownership, strict Joi request validation, and comprehensive error handling.',
  },
  servers,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66fe08e8b61e2a001fb1e001' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-10-05T10:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-10-05T10:00:00.000Z' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66fe08e8b61e2a001fb1e002' },
          title: { type: 'string', example: 'Implement Authentication' },
          description: { type: 'string', example: 'Set up JWT authentication and password hashing with bcrypt' },
          status: {
            type: 'string',
            enum: TASK_STATUS_VALUES,
            example: 'in-progress',
          },
          owner: { type: 'string', example: '66fe08e8b61e2a001fb1e001' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-10-05T10:15:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-10-05T10:30:00.000Z' },
        },
      },
      AuthRegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50, example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          password: { type: 'string', minLength: 8, maxLength: 128, example: 'SecurePassword123!' },
        },
      },
      AuthLoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          password: { type: 'string', example: 'SecurePassword123!' },
        },
      },
      AuthResponseData: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      TaskCreateRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 100, example: 'Deploy to Cloud' },
          description: { type: 'string', maxLength: 1000, example: 'Configure environment variables and deploy service' },
          status: {
            type: 'string',
            enum: TASK_STATUS_VALUES,
            default: 'pending',
            example: 'pending',
          },
        },
      },
      TaskUpdateRequest: {
        type: 'object',
        description: 'Provide at least one field to update',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 100, example: 'Deploy to Render' },
          description: { type: 'string', minLength: 1, maxLength: 1000, example: 'Updated deployment instructions' },
          status: {
            type: 'string',
            enum: TASK_STATUS_VALUES,
            example: 'completed',
          },
        },
      },
      StandardSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully.' },
          data: { type: 'object', nullable: true },
        },
      },
      StandardErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'An error occurred processing the request.' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Please provide a valid email address' },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'API Health Check',
        description: 'Check the operational status, server uptime, and current environment.',
        tags: ['Health'],
        responses: {
          200: {
            description: 'API is running and healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'API is running and healthy.' },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'UP' },
                        uptime: { type: 'string', example: '124.50s' },
                        timestamp: { type: 'string', example: '2026-10-05T12:00:00.000Z' },
                        environment: { type: 'string', example: 'development' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        description: 'Creates a new user profile with securely hashed password and returns an initial JWT authentication token.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User registered successfully.' },
                    data: { $ref: '#/components/schemas/AuthResponseData' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
          409: {
            description: 'Conflict - Email already registered',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate existing user',
        description: 'Validates user credentials and issues a signed JWT token for accessing protected routes.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthLoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User logged in successfully.' },
                    data: { $ref: '#/components/schemas/AuthResponseData' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/tasks': {
      get: {
        summary: 'List user tasks',
        description: 'Returns all tasks belonging to the authenticated user. Supports filtering by status and pagination.',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            description: 'Filter tasks by status enum',
            required: false,
            schema: {
              type: 'string',
              enum: TASK_STATUS_VALUES,
            },
          },
          {
            name: 'page',
            in: 'query',
            description: 'Page number (default 1)',
            required: false,
            schema: { type: 'integer', default: 1, minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page (default 10, max 100)',
            required: false,
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          200: {
            description: 'Tasks retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Tasks retrieved successfully.' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Task' },
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer', example: 25 },
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        totalPages: { type: 'integer', example: 3 },
                        hasNextPage: { type: 'boolean', example: true },
                        hasPrevPage: { type: 'boolean', example: false },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - Missing or invalid token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new task',
        description: 'Creates a task owned by the authenticated user.',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskCreateRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Task created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task created successfully.' },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - Missing or invalid token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        summary: 'Get task by ID',
        description: 'Retrieves a single task owned by the authenticated user by its 24-character hexadecimal MongoDB ID.',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'MongoDB ObjectId of the task',
            schema: { type: 'string', example: '66fe08e8b61e2a001fb1e002' },
          },
        ],
        responses: {
          200: {
            description: 'Task retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task retrieved successfully.' },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad Request - Invalid ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - Missing or invalid token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
          404: {
            description: 'Task not found or access denied',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update a task',
        description: 'Performs a partial update on a task owned by the authenticated user. At least one field is required in request body.',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'MongoDB ObjectId of the task',
            schema: { type: 'string', example: '66fe08e8b61e2a001fb1e002' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskUpdateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Task updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task updated successfully.' },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation Error or Invalid ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - Missing or invalid token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
          404: {
            description: 'Task not found or access denied',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a task',
        description: 'Deletes a task owned by the authenticated user.',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'MongoDB ObjectId of the task',
            schema: { type: 'string', example: '66fe08e8b61e2a001fb1e002' },
          },
        ],
        responses: {
          200: {
            description: 'Task deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task deleted successfully.' },
                    data: { type: 'object', example: {} },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad Request - Invalid ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - Missing or invalid token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
          404: {
            description: 'Task not found or access denied',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc({
  swaggerDefinition,
  apis: [],
});

module.exports = swaggerSpec;
