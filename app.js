const express = require('express');
const connectToDatabase = require('./config/db-connection');
const errorHandler = require('./middleware/error-handler');
require('dotenv').config();

connectToDatabase();
const app = express();

app.use(errorHandler);
app.use('/api/posts', require('./routes/post-routes'));
app.use('/api/users', require('./routes/user-routes'));
app.use(errorHandler);


module.exports = app;