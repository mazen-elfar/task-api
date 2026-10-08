# Task API

A production-grade, secure, and fully documented RESTful API for task management built with **Node.js**, **Express**, **MongoDB**, and **Mongoose**.

---

## 1. Project Overview

The **Task API** is a modular, production-ready backend service designed around clean layered architecture principles (Routes → Controllers → Services → Models). It provides comprehensive task management (CRUD) capabilities, enterprise-grade stateless JWT authentication with secure blowfish password hashing (`bcryptjs`), strict multi-tenant data isolation, request validation powered by `Joi`, centralized operational error handling, and interactive OpenAPI 3.0 documentation via Swagger UI.

---

## 2. Features

- **Authentication & Authorization:**
  - User registration and login issuing signed JSON Web Tokens (JWT).
  - High-entropy password hashing using `bcryptjs` with 12 salt rounds.
  - Passwords excluded by default from database queries (`select: false`) and sanitized from API responses.
  - Token-protected routes with automatic `req.user` injection.
- **Task Management (CRUD):**
  - **Create:** Add new tasks with `title`, `description`, and controlled `status` enums.
  - **Read:** Retrieve paginated task lists with status filtering or fetch single tasks by ID.
  - **Update:** Partial update support via `PATCH` with strict field-level validation.
  - **Delete:** Remove tasks cleanly with confirmation.
- **Strict Data Isolation & Ownership:**
  - Every task is strictly bound to its creator (`owner` field).
  - Authenticated users can only access and manipulate their own tasks.
  - Unauthorized access attempts return `404 Not Found` (rather than `403 Forbidden`) to eliminate resource enumeration vectors.
- **Request Validation & Error Handling:**
  - Strict input validation on `body`, `query`, and `params` using `Joi` schemas.
  - Automatic stripping of unknown/injected fields.
  - Centralized operational error middleware returning consistent JSON error structures.
  - Environment-aware error responses (stack traces suppressed in production).
- **Security Best Practices:**
  - Secure HTTP headers via `helmet`.
  - Configurable Cross-Origin Resource Sharing (`cors`).
  - Rate limiting via `express-rate-limit` (general API limiter + dedicated auth limiter).
  - Body parser payload size caps (10kb) to guard against body-parser DoS.
- **Developer Experience & Tooling:**
  - Interactive Swagger / OpenAPI 3.0 UI at `/api-docs` and raw spec at `/api-docs.json`.
  - Reviewer-ready Postman collection with automatic token extraction.
  - Automated integration testing suite using Jest, Supertest, and in-memory MongoDB.

---

## 3. Technology Stack

| Component | Technology | Version / Details | Purpose |
|---|---|---|---|
| **Runtime** | Node.js | `>= 18.0.0` (LTS) | JavaScript runtime environment |
| **Framework** | Express.js | `^5.2.1` | Web application framework |
| **Database** | MongoDB | `>= 6.0` / Atlas | Document database |
| **ODM** | Mongoose | `^9.10.4` | MongoDB object modeling & schema enforcement |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | `^9.0.3` | Stateless token-based authentication |
| **Password Hashing** | `bcryptjs` | `^3.0.3` | One-way password hashing (12 rounds) |
| **Validation** | `Joi` | `^18.2.9` | Request schema validation & sanitization |
| **Security** | `helmet`, `cors`, `express-rate-limit` | Latest | Security headers, CORS, and brute-force mitigation |
| **Documentation** | `swagger-ui-express`, `swagger-jsdoc` | `^5.0.1` / `^6.3.0` | OpenAPI 3.0 specification & interactive UI |
| **Testing** | `jest`, `supertest`, `mongodb-memory-server` | `^30.5.2` | Integration testing with zero external dependencies |

---

## 4. Project Structure

```text
task-api/
├── .env.example                       # Environment variable template with safe placeholders
├── .gitignore                         # Git exclusion rules (node_modules, .env, coverage, etc.)
├── README.md                          # Comprehensive project documentation
├── package.json                       # Dependencies, engines, and npm lifecycle scripts
├── package-lock.json                  # Deterministic dependency tree lockfile
├── jest.config.js                     # Jest test runner configuration
├── render.yaml                        # Infrastructure-as-code deployment blueprint for Render
├── server.js                          # Process lifecycle & HTTP server listener
├── src/
│   ├── app.js                         # Express app assembly, middleware stack & route mounting
│   ├── config/
│   │   ├── db.js                      # MongoDB connection manager & lifecycle hooks
│   │   └── env.js                     # Centralized environment variable validation (fail-fast)
│   ├── constants/
│   │   ├── httpStatusCodes.js         # HTTP status code constants
│   │   └── taskStatus.js              # Controlled enum for task statuses ('pending', 'in-progress', 'completed')
│   ├── controllers/
│   │   ├── authController.js          # HTTP handlers for register & login
│   │   ├── healthController.js        # HTTP handler for /health
│   │   └── taskController.js          # HTTP handlers for task CRUD operations
│   ├── docs/
│   │   └── swaggerSpec.js             # OpenAPI 3.0.3 specification definition
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT verification & req.user injector
│   │   ├── errorMiddleware.js         # Centralized error handler & 404 handler
│   │   ├── rateLimiter.js             # General & auth-specific rate limiters
│   │   └── validateMiddleware.js      # Joi schema validation middleware
│   ├── models/
│   │   ├── Task.js                    # Task schema (title, description, status, owner, timestamps)
│   │   └── User.js                    # User schema (name, email, password hashing, timestamps)
│   ├── routes/
│   │   ├── authRoutes.js              # /api/auth route definitions
│   │   ├── healthRoutes.js            # /health route definitions
│   │   ├── index.js                   # Unified /api router aggregator
│   │   └── taskRoutes.js              # /api/tasks route definitions
│   ├── services/
│   │   ├── authService.js             # Authentication business logic & token issuance
│   │   └── taskService.js             # Task business logic & multi-tenant database queries
│   ├── utils/
│   │   ├── apiResponse.js             # Standardized API response helpers
│   │   ├── appError.js                # Custom operational error class
│   │   ├── asyncHandler.js            # Async error catching wrapper
│   │   └── logger.js                  # Structured environment-aware logger
│   └── validators/
│       ├── authValidator.js           # Joi schemas for registration and login
│       └── taskValidator.js           # Joi schemas for task creation, update, and query
├── postman/
│   └── task-api.postman_collection.json # Pre-configured Postman collection with token automation
└── tests/
    ├── setup.js                       # MongoMemoryServer lifecycle & test hooks
    ├── health.test.js                 # Health & documentation route integration tests
    ├── auth.test.js                   # Authentication route integration tests
    └── task.test.js                   # Task CRUD & authorization integration tests
```

---

## 5. Environment Variables

The application centralizes and validates all configuration in [`src/config/env.js`](file:///src/config/env.js). A template is provided in [`.env.example`](file:///.env.example):

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Optional | `5000` | Port for the HTTP server to listen on |
| `NODE_ENV` | Optional | `development` | Runtime environment (`development`, `production`, `test`) |
| `MONGODB_URI` | **Required** | `mongodb://localhost:27017/task-api` | MongoDB connection string (local or Atlas URI) |
| `JWT_SECRET` | **Required** | — | Cryptographic secret key used to sign and verify JWT tokens (minimum 32 characters) |
| `JWT_EXPIRES_IN` | Optional | `7d` | Token expiration timeframe (e.g., `1h`, `7d`, `30d`) |
| `CORS_ORIGIN` | Optional | `*` | Allowed CORS origins (comma-separated origins or `*`) |
| `RATE_LIMIT_WINDOW_MS` | Optional | `900000` | Rate limit evaluation window in milliseconds (default: 15 mins) |
| `RATE_LIMIT_MAX` | Optional | `100` | Max requests per IP within the rate limit window |

> [!CAUTION]
> Never commit your real `.env` file containing sensitive credentials to version control. The `.gitignore` file is configured to strictly exclude `.env`.

---

## 6. Installation & Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: A running local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone the repository
```bash
git clone https://github.com/mazen-elfar/task-api.git
cd task-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Create a local `.env` file from the provided `.env.example`:
```bash
cp .env.example .env
```
Update `.env` with your MongoDB connection string and a secure JWT secret:
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

## 7. Running Locally

### Development mode (with auto-reload via nodemon)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

Once started, the server outputs:
```text
Server running in [development] mode on port: 5000
Swagger documentation available at: http://localhost:5000/api-docs
Health check available at: http://localhost:5000/health
```

---

## 8. Testing

The test suite runs against an isolated, high-speed in-memory MongoDB server (`mongodb-memory-server`), ensuring that tests do **not** affect any local or cloud databases and require zero network connectivity.

### Run all tests:
```bash
npm test
```

### Run tests with coverage:
```bash
npm run test:coverage
```

### Test Coverage Highlights (39/39 passing):
- **Health & Docs (4 tests):** Root welcome, `/health` status check, OpenAPI spec availability, and 404 handling.
- **Authentication (9 tests):** User registration, conflict on duplicate email, schema validation, successful login, incorrect password handling, non-existent user handling.
- **Tasks & Authorization (26 tests):** Missing/invalid/expired token rejection, task creation (defaults and explicit status), input validation, listing with status filtering, pagination (`page`, `limit`), get by ID, malformed ObjectId handling, partial updates via PATCH, delete operations, and strict **multi-tenant ownership isolation** (User B cannot view, list, update, or delete User A's tasks).

---

## 9. API Endpoints

### Public Endpoints
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/` | Welcome payload with documentation links | `200` |
| `GET` | `/health` | Server operational status, uptime & timestamp | `200` |
| `GET` | `/api-docs` | Interactive Swagger UI documentation | `200` |
| `GET` | `/api-docs.json` | OpenAPI 3.0.3 raw JSON specification | `200` |

### Authentication Endpoints
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user and receive a JWT token | `201`, `400`, `409` |
| `POST` | `/api/auth/login` | Authenticate user credentials and receive a JWT token | `200`, `400`, `401` |

### Task Endpoints (Protected by JWT)
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/api/tasks` | Create a new task belonging to the authenticated user | `201`, `400`, `401` |
| `GET` | `/api/tasks` | List tasks for authenticated user (supports `status`, `page`, `limit`) | `200`, `400`, `401` |
| `GET` | `/api/tasks/:id` | Retrieve a specific task by its 24-char ObjectId | `200`, `400`, `401`, `404` |
| `PATCH` | `/api/tasks/:id` | Partially update a task (`title`, `description`, `status`) | `200`, `400`, `401`, `404` |
| `DELETE` | `/api/tasks/:id` | Delete a task belonging to the authenticated user | `200`, `400`, `401`, `404` |

---

## 10. Authentication Guide

Authentication is stateless and uses **JSON Web Tokens (JWT)**.

### Header Requirement:
All protected endpoints require the JWT in the standard HTTP `Authorization` header:
```http
Authorization: Bearer <your_jwt_token_here>
```

### Flow:
1. Register via `POST /api/auth/register` or log in via `POST /api/auth/login`.
2. Extract the returned `data.token`.
3. Include the token in subsequent requests as `Authorization: Bearer <token>`.

---

## 11. Task CRUD Usage & Examples

### 1. Create a Task
- **Endpoint:** `POST /api/tasks`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
```json
{
  "title": "Build RESTful API",
  "description": "Implement authentication and CRUD operations with Mongoose",
  "status": "in-progress"
}
```
*Note: `status` is optional and defaults to `"pending"`. Allowed values: `"pending"`, `"in-progress"`, `"completed"`.*

- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    "_id": "67030588691500d00f7229e1",
    "title": "Build RESTful API",
    "description": "Implement authentication and CRUD operations with Mongoose",
    "status": "in-progress",
    "owner": "67030588691500d00f7229df",
    "createdAt": "2026-10-07T18:00:00.000Z",
    "updatedAt": "2026-10-07T18:00:00.000Z"
  }
}
```

### 2. List Tasks (with Filtering & Pagination)
- **Endpoint:** `GET /api/tasks?status=in-progress&page=1&limit=10`
- **Headers:** `Authorization: Bearer <token>`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully.",
  "data": [
    {
      "_id": "67030588691500d00f7229e1",
      "title": "Build RESTful API",
      "description": "Implement authentication and CRUD operations with Mongoose",
      "status": "in-progress",
      "owner": "67030588691500d00f7229df",
      "createdAt": "2026-10-07T18:00:00.000Z",
      "updatedAt": "2026-10-07T18:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### 3. Get Task by ID
- **Endpoint:** `GET /api/tasks/67030588691500d00f7229e1`
- **Headers:** `Authorization: Bearer <token>`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Task retrieved successfully.",
  "data": {
    "_id": "67030588691500d00f7229e1",
    "title": "Build RESTful API",
    "description": "Implement authentication and CRUD operations with Mongoose",
    "status": "in-progress",
    "owner": "67030588691500d00f7229df",
    "createdAt": "2026-10-07T18:00:00.000Z",
    "updatedAt": "2026-10-07T18:00:00.000Z"
  }
}
```

### 4. Update Task (Partial Update)
- **Endpoint:** `PATCH /api/tasks/67030588691500d00f7229e1`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
```json
{
  "status": "completed"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Task updated successfully.",
  "data": {
    "_id": "67030588691500d00f7229e1",
    "title": "Build RESTful API",
    "description": "Implement authentication and CRUD operations with Mongoose",
    "status": "completed",
    "owner": "67030588691500d00f7229df",
    "createdAt": "2026-10-07T18:00:00.000Z",
    "updatedAt": "2026-10-07T18:05:00.000Z"
  }
}
```

### 5. Delete Task
- **Endpoint:** `DELETE /api/tasks/67030588691500d00f7229e1`
- **Headers:** `Authorization: Bearer <token>`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Task deleted successfully.",
  "data": {}
}
```

---

## 12. Validation Rules & Error Handling

All incoming requests are validated against strict `Joi` schemas before reaching controllers:

### Validation Constraints:
- **Registration:**
  - `name`: String, 2 to 50 characters, trimmed, required.
  - `email`: Valid email format, normalized to lowercase, required.
  - `password`: String, 8 to 128 characters, required.
- **Tasks:**
  - `title`: String, 1 to 100 characters, trimmed, required on create.
  - `description`: String, maximum 1000 characters, optional (defaults to empty string).
  - `status`: Enum string (`pending`, `in-progress`, `completed`), optional (defaults to `pending`).
  - `id` (in route params): Exactly 24-character hexadecimal MongoDB ObjectId pattern.
- **Query Parameters:**
  - `status`: Must match allowed enum values if supplied.
  - `page`: Positive integer (min: 1, default: 1).
  - `limit`: Integer between 1 and 100 (default: 10).

### Standardized Error Format (`400 Bad Request`):
When validation fails, the API responds with structured details:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title cannot be empty"
    }
  ]
}
```

### Unknown Field Sanitization:
The validation middleware automatically strips undeclared fields (`stripUnknown: true`), preventing client payload pollution or privilege injection (e.g., attempting to pass `owner` in the request body).

---

## 13. Security Architecture & Best Practices

1. **Password Hashing:** Passwords are never stored in plain text. `bcryptjs` is applied in a pre-save hook with 12 salt rounds, offering strong resistance against brute-force and dictionary attacks.
2. **Field Sanitization (`select: false`):** The `password` field is excluded by default from all Mongoose query selections.
3. **Multi-Tenant Ownership Isolation:** Every task query enforces `{ owner: req.user._id }`. The API never allows a client to specify or modify the `owner` field.
4. **Information Disclosure Prevention:** Attempting to retrieve, update, or delete another user's task returns `404 Not Found` rather than `403 Forbidden`, preventing attackers from enumerating task IDs across the platform.
5. **Rate Limiting:**
   - General API limiter: 100 requests per 15-minute window per IP.
   - Auth limiter: 10 login/register attempts per 15-minute window per IP to safeguard against brute-force credential stuffing.
6. **HTTP Security Headers:** `helmet` sets hardened HTTP response headers (XSS Protection, MIME-sniffing prevention, Frameguard).
7. **DoS Payload Mitigation:** Express body parsers are restricted to `10kb` to protect against payload flooding attacks.

---

## 14. Swagger / OpenAPI Documentation

Interactive OpenAPI 3.0 documentation is built into the application:

- **Production Interactive Swagger UI:** [https://task-api-zvh4.onrender.com/api-docs/](https://task-api-zvh4.onrender.com/api-docs/)
- **Production OpenAPI 3.0 JSON Spec:** [https://task-api-zvh4.onrender.com/api-docs.json](https://task-api-zvh4.onrender.com/api-docs.json)
- **Local Interactive Swagger UI:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Local OpenAPI 3.0 JSON Spec:** [http://localhost:5000/api-docs.json](http://localhost:5000/api-docs.json)

### Executing Requests in Swagger:
1. Open [https://task-api-zvh4.onrender.com/api-docs/](https://task-api-zvh4.onrender.com/api-docs/) (or `http://localhost:5000/api-docs` locally).
2. Select your desired server environment from the **Servers** dropdown (defaults to Production on Render, Local during development).
3. Under **Authentication**, invoke `POST /api/auth/register` or `POST /api/auth/login`.
4. Copy the token from the response data (`data.token`).
5. Click the green **Authorize** button at the top right of the Swagger UI.
6. Enter `Bearer <your_token>` and click **Authorize**.
7. All protected task endpoints can now be executed directly within the browser interface.

---

## 15. Postman Collection

A pre-configured, production-ready Postman collection is located at [`postman/task-api.postman_collection.json`](file:///postman/task-api.postman_collection.json).

### Features:
- **Collection Variables:**
  - `baseUrl`: Base URL of the API.
    - **Local Development:** `http://localhost:5000` (default)
    - **Production (Render):** `https://task-api-zvh4.onrender.com`
  - `token`: Automatically populated upon successful registration or login.
  - `taskId`: Dynamically saved when creating or querying tasks.
- **Automated Token Chaining:** The collection's test scripts automatically capture the JWT token upon calling `POST /api/auth/register` or `POST /api/auth/login` and store it in the `token` variable, so subsequent task requests work with zero manual token copy-pasting.

### How to Import:
1. Open **Postman**.
2. Click **Import** in the top left.
3. Select or drag-and-drop `postman/task-api.postman_collection.json`.
4. Run requests in sequence (Register/Login → Create Task → List Tasks → Update → Delete).

---

## 16. Deployment Guide

The repository includes a ready-to-use [`render.yaml`](file:///render.yaml) blueprint for one-click deployment on [Render](https://render.com), but can also be deployed to Railway, Fly.io, or Heroku.

### Important Hosting Notes:
> [!NOTE]
> **Render Free Tier Cold Starts:** On Render's free tier, web services spin down after 15 minutes of inactivity. The first request after idle can take **30 to 60 seconds** to wake up.
>
> **MongoDB Atlas Network Access:** In MongoDB Atlas, go to **Network Access** and ensure `0.0.0.0/0` (Allow Access from Anywhere) is enabled so cloud hosting platforms can establish connections.

### Deploying to Render Manually:
1. Push the repository to GitHub: `https://github.com/mazen-elfar/task-api`.
2. In the [Render Dashboard](https://dashboard.render.com), select **New +** → **Web Service**.
3. Connect your `task-api` repository.
4. Configure service parameters:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Configure Environment Variables in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or leave default)
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<A Secure 32+ Character Secret Key>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CORS_ORIGIN`: `*`
   - `RATE_LIMIT_WINDOW_MS`: `900000`
   - `RATE_LIMIT_MAX`: `100`
6. Click **Deploy Web Service**.

---

## 17. Submission Links & Materials

- **GitHub Repository:** [https://github.com/mazen-elfar/task-api](https://github.com/mazen-elfar/task-api)
- **Live Deployed API:** [https://task-api-zvh4.onrender.com](https://task-api-zvh4.onrender.com)
- **Swagger Documentation:** [https://task-api-zvh4.onrender.com/api-docs/](https://task-api-zvh4.onrender.com/api-docs/)
- **OpenAPI 3.0 JSON Spec:** [https://task-api-zvh4.onrender.com/api-docs.json](https://task-api-zvh4.onrender.com/api-docs.json)
- **Postman Collection:** Located in [`postman/task-api.postman_collection.json`](file:///postman/task-api.postman_collection.json)
- **License:** MIT
