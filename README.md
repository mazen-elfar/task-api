# Task API

A production-grade, secure, and fully documented RESTful API for task management built with **Node.js**, **Express**, **MongoDB**, and **Mongoose**.

---

## Overview

The **Task API** is a robust backend service designed with clean architecture principles. It provides comprehensive task management (CRUD) capabilities, enterprise-standard JWT authentication with secure password hashing, strict multi-tenant ownership enforcement, schema-level request validation using Zod, centralized operational error handling, and interactive Swagger/OpenAPI 3.0 documentation.

---

## Features

- **Authentication & Security:**
  - Secure user registration and login with JSON Web Tokens (JWT).
  - High-entropy password hashing using `bcryptjs` (salt rounds: 12).
  - Passwords excluded by default from database queries and API responses.
  - Security headers via `helmet`, rate limiting with `express-rate-limit`, and CORS support.
- **Task Management (CRUD):**
  - **Create:** Add new tasks with `title`, `description`, and controlled `status` enums.
  - **Read:** Retrieve paginated, filterable task lists or single tasks by ID.
  - **Update:** Partial update support via `PATCH` with field validation.
  - **Delete:** Remove tasks cleanly with confirmation.
- **Ownership & Data Isolation:**
  - Tasks are strictly bound to their creator.
  - Authenticated users cannot view, modify, or delete tasks belonging to other users (enforced via database scoping returning `404 Not Found` to prevent resource enumeration).
- **Validation & Error Handling:**
  - Strict input validation on `body`, `query`, and `params` powered by `Zod`.
  - Centralized operational error middleware with consistent HTTP status codes.
  - Development vs. production error separation (stack traces suppressed in production).
- **Documentation & Tools:**
  - Complete OpenAPI 3.0.3 interactive documentation via Swagger UI at `/api-docs`.
  - Pre-configured Postman collection with automatic token extraction and chaining.
  - Automated integration testing suite powered by Jest, Supertest, and in-memory MongoDB.

---

## Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Runtime** | Node.js (v18+) | JavaScript runtime engine |
| **Framework** | Express.js 4.x | Fast, unopinionated web framework |
| **Database** | MongoDB & Mongoose 8.x | Document database & Object Data Modeling |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | Stateless token-based authorization |
| **Password Hashing** | `bcryptjs` | Optimized blowfish password hashing |
| **Validation** | `Joi` | Schema validation for body, query, and params |
| **Security** | `helmet`, `cors`, `express-rate-limit` | HTTP headers, origin protection & DDoS prevention |
| **Documentation** | `swagger-jsdoc` + `swagger-ui-express` | OpenAPI 3.0 generation and interactive UI |
| **Testing** | `jest`, `supertest`, `mongodb-memory-server` | Integration test suite with zero external DB dependencies |

---

## Project Structure

```text
task-api/
├── .env.example                       # Environment variable template with placeholders
├── .gitignore                         # Git exclusion rules
├── README.md                          # Comprehensive documentation
├── package.json                       # Dependencies, engines, and npm scripts
├── server.js                          # Process lifecycle & HTTP entry point
├── src/
│   ├── app.js                         # Express app assembly & middleware stack
│   ├── config/
│   │   ├── db.js                      # MongoDB connection manager & lifecycle hooks
│   │   └── env.js                     # Environment variable validation & centralized config
│   ├── constants/
│   │   ├── httpStatusCodes.js         # HTTP status code constants
│   │   └── taskStatus.js              # Task status enum ('pending', 'in-progress', 'completed')
│   ├── controllers/
│   │   ├── authController.js          # Controller for register and login endpoints
│   │   ├── healthController.js        # Controller for /health endpoint
│   │   └── taskController.js          # Controller for task CRUD endpoints
│   ├── docs/
│   │   └── swaggerSpec.js             # Complete OpenAPI 3.0.3 specification
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT authentication & req.user injector
│   │   ├── errorMiddleware.js         # Centralized error handler & 404 handler
│   │   ├── rateLimiter.js             # General & auth-specific rate limiting
│   │   └── validateMiddleware.js      # Zod schema validation middleware
│   ├── models/
│   │   ├── Task.js                    # Task schema (title, description, status, user, timestamps)
│   │   └── User.js                    # User schema (name, email, password hashing)
│   ├── routes/
│   │   ├── authRoutes.js              # /api/auth routes
│   │   ├── healthRoutes.js            # /health routes
│   │   ├── index.js                   # Unified /api router aggregator
│   │   └── taskRoutes.js              # /api/tasks routes
│   ├── services/
│   │   ├── authService.js             # Auth business logic & token signing
│   │   └── taskService.js             # Task business logic & ownership queries
│   ├── utils/
│   │   ├── apiResponse.js             # Standardized JSON response helpers
│   │   ├── appError.js                # Custom operational error class
│   │   ├── asyncHandler.js            # Controller async error wrapper
│   │   └── logger.js                  # Structured environment-aware logger
│   └── validators/
│       ├── authValidator.js           # Auth request schemas
│       └── taskValidator.js           # Task request schemas
├── postman/
│   └── task-api.postman_collection.json # Complete Postman collection
└── tests/
    ├── setup.js                       # MongoMemoryServer lifecycle setup
    ├── health.test.js                 # Health endpoint tests
    ├── auth.test.js                   # Authentication integration tests
    └── task.test.js                   # Task CRUD & authorization integration tests
```

---

## Requirements

- **Node.js**: `v18.0.0` or higher (tested on Node `v22.x`)
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas cluster URI

---

## Installation & Local Setup

### 1. Clone the repository
```bash
git clone <repository_url> task-api
cd task-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the `.env.example` file to create your `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your connection details:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/task-api
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## Running Locally

### Development mode (with auto-reload)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

### Running Tests
The automated test suite runs against an isolated, in-memory MongoDB server (`mongodb-memory-server`), requiring no local database or external connectivity:
```bash
npm test
```

For test coverage reporting:
```bash
npm run test:coverage
```

---

## API Documentation (Swagger / OpenAPI)

Once the application is running, the interactive Swagger UI documentation is accessible at:

```text
http://localhost:5000/api-docs
```

The raw OpenAPI 3.0 JSON specification is available at:
```text
http://localhost:5000/api-docs.json
```

Reviewers can execute requests directly through the Swagger interface by registering, copying the JWT token, and clicking the **Authorize** button (`Bearer <token>`).

---

## Authentication

Authentication is implemented using stateless **JSON Web Tokens (JWT)**.

1. **Registration:** `POST /api/auth/register` creates an account and returns a signed JWT.
2. **Login:** `POST /api/auth/login` verifies credentials and issues a signed JWT.
3. **Protected Routes:** All task endpoints require the token sent in the HTTP `Authorization` header:
   ```text
   Authorization: Bearer <your_token_here>
   ```

Tokens encode the user's ID and email, validated via `authMiddleware`. If missing, malformed, or expired, the API immediately returns `401 Unauthorized`.

---

## API Endpoints

### Health
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|---|---|---|
| `GET` | `/health` | No | Server operational health & uptime | `200` |
| `GET` | `/` | No | API welcome and doc links | `200` |

### Authentication
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user | `201`, `400`, `409` |
| `POST` | `/api/auth/login` | No | Authenticate user & get JWT | `200`, `400`, `401` |

### Tasks
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/tasks` | Bearer JWT | Create a new task | `201`, `400`, `401` |
| `GET` | `/api/tasks` | Bearer JWT | List tasks for authenticated user | `200`, `401` |
| `GET` | `/api/tasks/:id` | Bearer JWT | Get task by ID | `200`, `400`, `401`, `404` |
| `PATCH` | `/api/tasks/:id` | Bearer JWT | Partially update a task | `200`, `400`, `401`, `404` |
| `DELETE` | `/api/tasks/:id` | Bearer JWT | Delete a task | `200`, `400`, `401`, `404` |

---

## Task Ownership Rules

- **Data Isolation:** Every task is strictly associated with its creator via the `owner` field in the database.
- **Request Sanitization:** The API never trusts an `owner` field supplied in the request body. The owner is always inferred directly from the verified JWT payload.
- **Security by Design:** If a user attempts to retrieve, update, or delete a task belonging to another user, the API responds with `404 Not Found` (not `403 Forbidden`). This strictly prevents attackers from enumerating valid task IDs in the system.

---

## Deployment

The application is cloud-ready and can be deployed directly to **Render**, **Railway**, or any Node.js hosting platform.

### Important Deployment Notes:
> [!NOTE]
> **Render Free Tier Cold Starts:** On Render's free tier, services spin down after 15 minutes of inactivity. The first incoming request may take **30 to 60 seconds** to wake up the server.
>
> **MongoDB Atlas Network Access:** In your MongoDB Atlas dashboard, navigate to **Network Access** and ensure you have added IP Address `0.0.0.0/0` (Allow Access from Anywhere). This is required because cloud hosting platforms like Render utilize dynamic outbound IP ranges.

### Deploying to Render:
1. Push your repository to GitHub (repository name: `task-api`).
2. Log in to [Render](https://render.com) and create a **New Web Service**.
3. Connect your GitHub repository `task-api`.
4. Set the following build settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Configure Environment Variables in the Render dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or leave default for Render to assign)
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<A Secure 32+ Character Secret Key>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CORS_ORIGIN`: `*`
6. Deploy service.

---

## Submission & Live URLs

> *Note: Update these URLs with your deployed service and repository links upon submission.*

- **GitHub Repository:** `<repository URL>`
- **Live Deployed API:** `<deployed URL>`
- **Swagger Documentation:** `<deployed URL>/api-docs`
- **Postman Collection:** `postman/task-api.postman_collection.json`
