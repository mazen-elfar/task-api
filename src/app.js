const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const config = require('./config/env');
const routes = require('./routes');
const healthRoutes = require('./routes/healthRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const swaggerSpec = require('./docs/swaggerSpec');

const app = express();

// Trust reverse proxy in production (Render load balancer / edge proxy)
// Trusting 1 hop ensures req.ip resolves to the real client IP via X-Forwarded-For
// while preventing arbitrary proxy header spoofing and resolving express-rate-limit validation warnings.
if (config.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security HTTP headers (disable CSP specifically for Swagger UI compatibility)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: config.CORS_ORIGIN === '*' ? '*' : config.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

// HTTP request logger (skip in test environment)
if (config.NODE_ENV !== 'test') {
  app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body parsers with sensible size limits to prevent body-parser DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Swagger / OpenAPI documentation endpoints
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Task Management API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  })
);

// Raw OpenAPI JSON spec endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint (exempt from rate limits)
app.use('/health', healthRoutes);

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// Mount main API routes
app.use('/api', routes);

// Root path redirect or welcome
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Task Management REST API.',
    documentation: '/api-docs',
    health: '/health',
  });
});

// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
