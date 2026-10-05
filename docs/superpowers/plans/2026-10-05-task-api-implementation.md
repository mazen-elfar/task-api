# Task Management RESTful API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and prepare a production-grade, secure, fully tested, documented, and deployment-ready RESTful Task Management API using Node.js, Express, MongoDB, and Mongoose that satisfies all company assessment requirements.

**Architecture:** Clean layered architecture with strict separation of concerns (Routes → Controllers → Services → Models), centralized Zod request validation, robust JWT authentication with ownership protection, centralized error handling, Swagger OpenAPI 3.0 documentation, and a ready-to-run Postman collection.

**Tech Stack:** Node.js (v22+), Express.js 4.x, MongoDB, Mongoose 8.x, JSON Web Tokens (jsonwebtoken), Password Hashing (bcryptjs), Schema Validation (zod), Security (helmet, cors, express-rate-limit), Documentation (swagger-ui-express), Testing (jest, supertest, mongodb-memory-server).

---

## Workspace Inspection Summary

- **Directory:** `E:\Work\companys tests\Company AppRO8`
- **Initial State:** Empty directory, no existing git repo, no existing files.
- **Node Environment:** Node `v22.17.0`, npm `11.4.2`, git `2.50.1.windows.1`.
- **Target Git Repository Name:** `task-api`

---

## File Structure Breakdown

```text
task-api/
├── .env.example                       # Environment variable template with placeholders
├── .gitignore                         # Strict gitignore excluding node_modules, .env, coverage, etc.
├── README.md                          # Comprehensive reviewer-ready documentation
├── package.json                       # Project manifests, scripts (start, dev, test)
├── server.js                          # Process entry point: port binding & graceful shutdown
├── src/
│   ├── app.js                         # Express app setup, security middlewares, route mounting, 404 & global error handler
│   ├── config/
│   │   ├── env.js                     # Validates required env vars on startup (fail-fast)
│   │   └── db.js                      # Mongoose connection management & lifecycle hooks
│   ├── constants/
│   │   ├── httpStatusCodes.js         # HTTP status code constants
│   │   └── taskStatus.js              # Controlled enum for task statuses ('pending', 'in-progress', 'completed')
│   ├── controllers/
│   │   ├── authController.js          # HTTP handler for register & login
│   │   ├── taskController.js          # HTTP handler for task CRUD
│   │   └── healthController.js        # HTTP handler for /health
│   ├── docs/
│   │   └── swaggerSpec.js             # Complete OpenAPI 3.0.3 specification definition
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT verification & req.user injection
│   │   ├── errorMiddleware.js         # Centralized error handler & 404 handler
│   │   ├── rateLimiter.js             # Rate limiting configuration (general & auth specific)
│   │   └── validateMiddleware.js      # Generic Zod validation middleware for body, query, params
│   ├── models/
│   │   ├── User.js                    # Mongoose User schema with bcrypt hooks and password exclusions
│   │   └── Task.js                    # Mongoose Task schema with user ownership, enum status, timestamps
│   ├── routes/
│   │   ├── authRoutes.js              # /api/auth routes
│   │   ├── taskRoutes.js              # /api/tasks routes (protected)
│   │   ├── healthRoutes.js            # /health route
│   │   └── index.js                   # Unified API router
│   ├── services/
│   │   ├── authService.js             # Auth business logic: registration, password verification, JWT generation
│   │   └── taskService.js             # Task business logic: CRUD operations & ownership enforcement
│   ├── utils/
│   │   ├── apiResponse.js             # Consistent response builders: sendSuccess & sendError
│   │   ├── appError.js                # Custom operational AppError class
│   │   ├── asyncHandler.js            # Wraps async controllers to eliminate try/catch blocks
│   │   └── logger.js                  # Clean console/structured logging utility
│   └── validators/
│       ├── authValidator.js           # Zod schemas for register & login
│       └── taskValidator.js           # Zod schemas for create, update, and param/query validation
├── postman/
│   └── task-api.postman_collection.json # Production-ready Postman collection with auto-JWT saving
└── tests/
    ├── setup.js                       # MongoMemoryServer in-memory DB lifecycle for tests
    ├── health.test.js                 # Health check endpoint test
    ├── auth.test.js                   # Authentication & validation integration tests
    └── task.test.js                   # Task CRUD & authorization/ownership integration tests
```

---

## Detailed Task Breakdown

### Task 1: Project Scaffolding, Git Initialization & Configuration

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/config/env.js`
- Create: `src/config/db.js`
- Create: `src/constants/httpStatusCodes.js`
- Create: `src/constants/taskStatus.js`
- Create: `src/utils/logger.js`
- Create: `src/utils/appError.js`
- Create: `src/utils/asyncHandler.js`
- Create: `src/utils/apiResponse.js`

- [ ] **Step 1: Initialize Git and create `.gitignore`**
  Initialize git repository with branch `main`. Create `.gitignore` to protect `.env`, `node_modules`, `coverage`, and OS files.
- [ ] **Step 2: Create `package.json` and install dependencies**
  Install production dependencies: `express`, `mongoose`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `zod`, `cors`, `helmet`, `express-rate-limit`, `swagger-ui-express`, `morgan`.
  Install dev dependencies: `nodemon`, `jest`, `supertest`, `mongodb-memory-server`.
- [ ] **Step 3: Implement environment validation (`src/config/env.js`) and database connector (`src/config/db.js`)**
  Fail-fast validation for `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`. Mongoose connection logic with error handling.
- [ ] **Step 4: Implement core utilities**
  Create `httpStatusCodes.js`, `taskStatus.js`, `logger.js`, `appError.js`, `asyncHandler.js`, `apiResponse.js`.
- [ ] **Step 5: Verify setup and commit**
  Verify node can require configuration without errors. Commit with message `chore: initialize project scaffolding and core config`.

---

### Task 2: Models & Database Layer (User & Task)

**Files:**
- Create: `src/models/User.js`
- Create: `src/models/Task.js`

- [ ] **Step 1: Implement `User` Model**
  Define fields: `name` (required, trimmed), `email` (required, unique, lowercase, trimmed, indexed), `password` (required, min 8, `select: false`), timestamps.
  Add pre-save hook to hash password using `bcryptjs` with salt factor 12.
  Add instance method `comparePassword(candidatePassword)`.
  Add `toJSON` transform to strip `password` and `__v`.
- [ ] **Step 2: Implement `Task` Model**
  Define fields: `title` (required, trimmed, max 100), `description` (required, trimmed, max 1000), `status` (enum: `'pending'`, `'in-progress'`, `'completed'`, default `'pending'`), `user` (ref: `'User'`, required, indexed), timestamps (`createdAt`, `updatedAt`).
  Add compound index on `{ user: 1, createdAt: -1 }`.
  Add `toJSON` transform to strip `__v`.
- [ ] **Step 3: Verify models and commit**
  Run syntax/import validation on models. Commit with message `feat: add User and Task mongoose models`.

---

### Task 3: Centralized Error Handling, Response Standardization & Validation Middleware

**Files:**
- Create: `src/middleware/errorMiddleware.js`
- Create: `src/middleware/validateMiddleware.js`
- Create: `src/validators/authValidator.js`
- Create: `src/validators/taskValidator.js`

- [ ] **Step 1: Implement generic Zod validation middleware**
  Create `validate(schema)` middleware that validates `req.body`, `req.query`, and `req.params`. Format validation errors into structured array `{ field, message }`.
- [ ] **Step 2: Implement validation schemas**
  `authValidator.js`: schemas for `register` (`name`, `email`, `password`) and `login` (`email`, `password`).
  `taskValidator.js`: schemas for `createTask` (`title`, `description`, optional `status`), `updateTask` (at least one of `title`, `description`, `status`), and `taskIdParam` (MongoDB 24-hex-char ObjectId validation).
- [ ] **Step 3: Implement centralized error middleware**
  Handle CastError, ValidationError, Mongo duplicate key (11000), JsonWebTokenError, TokenExpiredError, and generic AppError.
  Ensure safe responses in production (suppress stack traces).
  Implement 404 handler for unknown routes.
- [ ] **Step 4: Verify and commit**
  Commit with message `feat: implement validation middleware and centralized error handling`.

---

### Task 4: JWT Authentication Flow & Authorization Middleware

**Files:**
- Create: `src/services/authService.js`
- Create: `src/controllers/authController.js`
- Create: `src/middleware/authMiddleware.js`
- Create: `src/routes/authRoutes.js`

- [ ] **Step 1: Implement `authService`**
  `registerUser`: check duplicate email (throws 409 Conflict), create user, generate signed JWT.
  `loginUser`: find user with `+password`, verify password with `comparePassword` (throws 401 if invalid), generate signed JWT.
  `generateToken`: signs JWT with configured secret and expiration.
- [ ] **Step 2: Implement `authController`**
  `register`: call `authService.registerUser`, respond with 201 Created and standard response `{ success: true, message: "User registered successfully", data: { user, token } }`.
  `login`: call `authService.loginUser`, respond with 200 OK and standard response `{ success: true, message: "Login successful", data: { user, token } }`.
- [ ] **Step 3: Implement `authMiddleware`**
  Extract Bearer token from `Authorization` header.
  Verify token with `jwt.verify`.
  Handle missing token (401), invalid token (401), expired token (401).
  Fetch user from DB to verify account still exists.
  Attach user to `req.user`.
- [ ] **Step 4: Implement `authRoutes`**
  Mount routes with validation:
  `POST /register` -> `validate(registerSchema)`, `authController.register`
  `POST /login` -> `validate(loginSchema)`, `authController.login`
- [ ] **Step 5: Verify and commit**
  Commit with message `feat: implement JWT authentication and authorization middleware`.

---

### Task 5: Task CRUD Service, Controller & Routes with Ownership Enforcement

**Files:**
- Create: `src/services/taskService.js`
- Create: `src/controllers/taskController.js`
- Create: `src/routes/taskRoutes.js`

- [ ] **Step 1: Implement `taskService`**
  `createTask(userId, taskData)`: creates task with `user: userId`.
  `getTasks(userId, query)`: finds tasks with `user: userId`, supports pagination (`page`, `limit`) and status filter.
  `getTaskById(userId, taskId)`: finds task by `_id: taskId` and `user: userId` (throws 404 if not found).
  `updateTask(userId, taskId, updateData)`: finds and updates task belonging to `userId` (throws 404 if not found).
  `deleteTask(userId, taskId)`: finds and deletes task belonging to `userId` (throws 404 if not found).
- [ ] **Step 2: Implement `taskController`**
  `createTask`: returns 201 Created with created task.
  `getTasks`: returns 200 OK with task array and pagination metadata.
  `getTaskById`: returns 200 OK with task data.
  `updateTask`: returns 200 OK with updated task data.
  `deleteTask`: returns 200 OK with success message.
- [ ] **Step 3: Implement `taskRoutes`**
  Apply `authMiddleware` to all task routes.
  `POST /` -> `validate(createTaskSchema)`, `taskController.createTask`
  `GET /` -> `validate(getTasksQuerySchema)`, `taskController.getTasks`
  `GET /:id` -> `validate(taskIdParamSchema)`, `taskController.getTaskById`
  `PATCH /:id` -> `validate(taskIdParamSchema)`, `validate(updateTaskSchema)`, `taskController.updateTask`
  `DELETE /:id` -> `validate(taskIdParamSchema)`, `taskController.deleteTask`
- [ ] **Step 4: Verify and commit**
  Commit with message `feat: implement Task CRUD with strict ownership enforcement`.

---

### Task 6: Express App Assembly, Security Middleware, Health Check & Server Entry Point

**Files:**
- Create: `src/controllers/healthController.js`
- Create: `src/routes/healthRoutes.js`
- Create: `src/routes/index.js`
- Create: `src/middleware/rateLimiter.js`
- Create: `src/app.js`
- Create: `server.js`

- [ ] **Step 1: Implement health controller and route**
  `GET /health`: returns 200 with `{ success: true, message: "API is healthy", uptime: ..., timestamp: ..., environment: ... }`.
- [ ] **Step 2: Implement rate limiting middleware**
  General API rate limiter (e.g. 100 requests per 15 min window) and stricter auth rate limiter (e.g. 10 attempts per 15 min).
- [ ] **Step 3: Assemble Express `app.js`**
  Configure `helmet()`, `cors()`, `express.json()`, `express.urlencoded()`, `morgan()`, rate limiter.
  Mount unified router `/api` (`/api/auth`, `/api/tasks`) and `/health`.
  Mount Swagger UI at `/api-docs`.
  Mount 404 handler and global error middleware.
- [ ] **Step 4: Create `server.js`**
  Connect to MongoDB via `connectDB()`.
  Start HTTP server on `PORT`.
  Implement graceful shutdown handlers for `SIGINT` and `SIGTERM`.
- [ ] **Step 5: Verify and commit**
  Commit with message `feat: assemble Express app, security middleware, and server lifecycle`.

---

### Task 7: Swagger / OpenAPI 3.0 Documentation

**Files:**
- Create: `src/docs/swaggerSpec.js`

- [ ] **Step 1: Write complete OpenAPI 3.0.3 specification**
  Include API title, version, description, server URLs (local and deployed).
  Define SecurityScheme: `bearerAuth` (type `http`, scheme `bearer`, bearerFormat `JWT`).
  Document `/health`: 200 response schema.
  Document `/api/auth/register`: body schema, 201 success, 400 validation error, 409 conflict.
  Document `/api/auth/login`: body schema, 200 success, 400 validation error, 401 unauthorized.
  Document `/api/tasks` [GET, POST]: query parameters, request body, 200/201 responses, 401 unauthorized.
  Document `/api/tasks/{id}` [GET, PATCH, DELETE]: path parameter, request body, 200 response, 400 invalid ID, 401 unauthorized, 404 not found.
  Define all reusable component schemas: `User`, `Task`, `AuthResponse`, `TaskResponse`, `TaskListResponse`, `ErrorResponse`.
- [ ] **Step 2: Mount Swagger UI at `/api-docs` and expose raw JSON at `/api-docs.json`**
  Review rendered Swagger UI to ensure all endpoints, parameters, models, and security tags match the actual implementation.
- [ ] **Step 3: Commit**
  Commit with message `docs: add comprehensive OpenAPI 3.0 Swagger specification and UI`.

---

### Task 8: Postman Collection Generation

**Files:**
- Create: `postman/task-api.postman_collection.json`

- [ ] **Step 1: Construct Postman Collection v2.1.0**
  Include collection variables: `baseUrl` (default `http://localhost:5000`) and `token`.
  Add Auth folder:
  - Register (with test script to automatically store token in variable if desired)
  - Login (with test script: `pm.collectionVariables.set("token", pm.response.json().data.token)`)
  Add Tasks folder:
  - Create Task (POST /api/tasks with sample JSON body)
  - Get All Tasks (GET /api/tasks with status/page query options)
  - Get Task By ID (GET /api/tasks/{{taskId}})
  - Update Task (PATCH /api/tasks/{{taskId}} with status update)
  - Delete Task (DELETE /api/tasks/{{taskId}})
  Add Health Check (GET /health).
  Configure Bearer Token authentication inheriting `{{token}}` for all Task requests.
- [ ] **Step 2: Verify JSON format and commit**
  Commit with message `feat: add complete Postman collection with automatic token handling`.

---

### Task 9: Comprehensive Automated Testing Suite

**Files:**
- Create: `tests/setup.js`
- Create: `tests/health.test.js`
- Create: `tests/auth.test.js`
- Create: `tests/task.test.js`

- [ ] **Step 1: Implement `tests/setup.js`**
  Set up `mongodb-memory-server` lifecycle: beforeAll (start in-memory mongo, connect mongoose), beforeEach (clear database collections), afterAll (stop mongo, close connection).
- [ ] **Step 2: Implement `health.test.js`**
  Test `GET /health` returns 200 and healthy status.
- [ ] **Step 3: Implement `auth.test.js`**
  Test user registration (success 201).
  Test duplicate registration (conflict 409).
  Test registration validation errors (bad email, short password 400).
  Test user login (success 200).
  Test login with wrong password (unauthorized 401).
  Test login with non-existent user (unauthorized 401).
- [ ] **Step 4: Implement `task.test.js`**
  Test create task without token (unauthorized 401).
  Test create task with valid data (created 201).
  Test create task with invalid status (bad request 400).
  Test get all tasks for user (success 200).
  Test get task by ID (success 200).
  Test get task by invalid ObjectId (bad request 400).
  Test get non-existent task (not found 404).
  Test update task (success 200).
  Test delete task (success 200).
  Test user isolation / ownership: User A cannot get, update, or delete User B's task (returns 404).
- [ ] **Step 5: Run test suite via `npm test` and verify 100% pass**
  Run Jest test suite, check for zero failures or warnings.
- [ ] **Step 6: Commit**
  Commit with message `test: add comprehensive integration test suite with in-memory mongodb`.

---

### Task 10: Production README.md & Deployment Preparation

**Files:**
- Create: `README.md`
- Create: `render.yaml` (optional Render blueprint for instant 1-click deployment)

- [ ] **Step 1: Write comprehensive, reviewer-friendly README.md**
  Overview, Architecture, Tech Stack, Prerequisites, Quickstart & Local Setup, Environment Variables guide, Running Tests, Complete API Reference table, Authentication guide, Swagger UI guide, Postman setup guide, Deployment instructions (Render/Railway with MongoDB Atlas), and Submission links section.
- [ ] **Step 2: Create production deployment config**
  Verify start scripts (`npm start` -> `node server.js`), `NODE_ENV=production` compatibility.
- [ ] **Step 3: Commit**
  Commit with message `docs: add production-grade README and deployment guide`.

---

### Task 11: End-to-End Verification & Senior Backend Audit

- [ ] **Step 1: Audit against all 23 official requirement criteria**
  Check every item in the requirement checklist (pass/fail).
- [ ] **Step 2: Manual end-to-end execution test**
  Start server with dev configuration, verify endpoints, verify Swagger UI, verify error cases.
- [ ] **Step 3: Clean install verification**
  Verify package.json dependencies, lockfile, and no extraneous artifacts.
- [ ] **Step 4: Final Git status check**
  Ensure clean working tree, no committed secrets or `.env`, proper commit history.
