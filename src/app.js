require('dotenv').config();

const express = require('express');
const errorHandler = require('./middleware/error-handler');
const cookieParser = require('cookie-parser');
const limiter = require("./config/api-rate-limiter");

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());

// Route setup
app.use('/api/', limiter);
app.use('/api/v1/posts', require('./api/v1/routes/posts'));
app.use('/api/v1/users', require('./api/v1/routes/users'));
app.use('/api/v1/admin', require('./api/v1/routes/admin'));

// Error handling middleware
app.use(errorHandler);


module.exports = app;

/**
 * Add Logging and Monitoring
Integrate a logging library (e.g., winston, pino) for structured logs.
Add request logging (e.g., morgan).
Set up monitoring/alerting (e.g., Prometheus, Grafana, Sentry for error tracking).
2. API Versioning
Implement API versioning (e.g., /api/v1/posts) to support future changes without breaking clients.
3. Rate Limiting and Security Headers
Ensure robust rate limiting is in place.
Add security headers using helmet.
4. CORS Configuration
Fine-tune CORS settings to only allow trusted origins.
5. Validation and Sanitization
Use express-validator for input validation and sanitization on all endpoints.
6. Graceful Shutdown
Handle process signals to gracefully close DB and Redis connections on shutdown.
7. Health Check Endpoint
Add a /health or /status endpoint for uptime monitoring and orchestration tools.
8. Automated Backups
Set up automated backups for your MongoDB data.
9. Documentation
Add OpenAPI/Swagger documentation for all endpoints (if not already covered).
10. Performance Profiling
Use tools like clinic.js or node --inspect for performance profiling.
11. Container Security
Use multi-stage builds to reduce image size.
Run the container as a non-root user.
 * TODO: OPTIMIZE CODE FOR PERFORMANCE
 * TODO: ADD TESTS FOR ALL ROUTES + UNIT, INTEGRATION, AND END-TO-END TESTS
 * TODO: DOCUMENT EVERYTHING
 * TODO: REVIEW CODE
 * TODO: ADD AUTHENICATION TO ACCESS THE DATABASE
 * TODO: DOCKERIZE THE APP
 * TODO: DEPLOY THE APP
 * TODO: ADD README FILE
 * TODO: MAKE SURE THE APP IS SECURE
 * TODO: MAKE THE APP PUBLICLY AVAILABLE
 * 
 */