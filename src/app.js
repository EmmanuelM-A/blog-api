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
app.use('/api/v1/posts', require('./api/v1/routes/post-routes'));
app.use('/api/v1/users', require('./api/v1/routes/user-routes'));
app.use('/api/v1/admin', require('./api/v1/routes/admin-routes'));

// Error handling middleware
app.use(errorHandler);


module.exports = app;

/**
9. Documentation
Add OpenAPI/Swagger documentation for all endpoints (if not already covered).
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