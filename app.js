require('dotenv').config();

const express = require('express');
const errorHandler = require('./middleware/error-handler');
const cookieParser = require('cookie-parser');

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());

// Route setup
app.use('/api/posts', require('./routes/post-routes'));
app.use('/api/users', require('./routes/user-routes'));
app.use('/api/admin', require('./routes/admin-routes'));

// Error handling middleware
app.use(errorHandler);


module.exports = app;

/**
 * TODO: REFACTOR CODE TO USE ERROR AND SEND RESPONSE FUNCTIONS
 * TODO: ADD TESTS FOR ALL ROUTES
 * TODO: DOCUMENT EVERYTHING
 * TODO: OPTIMIZE CODE FOR PERFORMANCE
 * TODO: REVIEW CODE
 * TODO: DOCKERIZE THE APP
 * TODO: DEPLOY THE APP
 * TODO: ADD README FILE
 * 
 */