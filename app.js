const express = require('express');


// Initialize express app
const app = express();
app.use(express.json());
require('dotenv').config();

// Import routes here
app.use('/api/posts', require('./routes/posts'));
app.use('/api/auth', require('./routes/auth'));

// Swagger setup here

module.exports = app;
