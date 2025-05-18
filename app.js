const express = require('express');
const connectToDatabase = require('./config/db-connection');
require('dotenv').config();

connectToDatabase();
const app = express();
app.use(express.json());

// Import routes here
app.use('/api/posts', require('./routes/posts'));
app.use('/api/auth', require('./routes/auth'));

// Swagger setup here

module.exports = app;
