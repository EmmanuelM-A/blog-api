require('dotenv').config();

const express = require('express');
const errorHandler = require('./middleware/error-handler');
const cookieParser = require('cookie-parser');
const limiter = require("./middleware/api-rate-limiter");
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// Middlewares
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
);

// Route setup
app.use('/api/v1/', limiter);
app.use('/api/v1/posts', require('./api/v1/routes/post-routes'));
app.use('/api/v1/users', require('./api/v1/routes/user-routes'));
app.use('/api/v1/admin', require('./api/v1/routes/admin-routes'));

// Error handling middleware
app.use(errorHandler);

/**
 * TODO: SORT OUT SWAGGER DOCS
 * TODO: MAKE SURE API ROUTES WORK IN DOCS
 * TODO: UPDATE README.md
 * TODO: ADD TO PORTFOLIO
 */


module.exports = app;