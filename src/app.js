require('dotenv').config();

const express = require('express');
const errorHandler = require('./middleware/error-handler');
const cookieParser = require('cookie-parser');
const limiter = require("./middleware/api-rate-limiter");
const helmet = require('helmet');

const app = express();

// Middlewares
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

// Route setup
app.use('/api/', limiter);
app.use('/api/v1/posts', require('./api/v1/routes/posts'));
app.use('/api/v1/users', require('./api/v1/routes/user-routes'));
app.use('/api/v1/admin', require('./api/v1/routes/admin'));

// Error handling middleware
app.use(errorHandler);


module.exports = app;

/**
 * Add Logging and Monitoring
Integrate a logging library (e.g., winston, pino) for structured logs.
Add request logging (e.g., morgan).
Set up monitoring/alerting (e.g., Prometheus, Grafana, Sentry for error tracking).
3. Rate Limiting and Security Headers
Ensure robust rate limiting is in place.
Add security headers using helmet.
4. CORS Configuration
Fine-tune CORS settings to only allow trusted origins.
9. Documentation
Add OpenAPI/Swagger documentation for all endpoints (if not already covered).
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