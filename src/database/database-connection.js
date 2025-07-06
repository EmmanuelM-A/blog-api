const mongoose = require('mongoose');
const logger = require('../utils/logger');

require('dotenv').config(); // Load environment variables from .env file

/**
 * @function connectToDatabase
 * @description
 * Asynchronously establishes a connection to a MongoDB database using Mongoose. 
 * It uses the connection string defined in the environment variable.
 *
 * If the connection attempt fails, it logs the error, closes any open Mongoose connections,
 * and terminates the Node.js process to prevent the application from running in a broken state.
 *
 * This function should typically be called during application startup (e.g., in `server.js`)
 * before handling any HTTP requests or interacting with the database.
 *
 * @async
 * @throws Will terminate the process if a connection error occurs.
 * @returns {Promise<void>} Resolves when the database connection is successfully established.
 * @see {@link https://mongoosejs.com/docs/connections.html Mongoose Connection Docs}
 */
const connectToDatabase = async () => {
    try {
        // Attempt to connect to MongoDB using the connection string from environment variables.
        await mongoose.connect(process.env.MONGO_URI);

        logger.info("Database connected!");
    } catch (error) {
        // If connection fails:
        
        // Gracefully close any existing connection (if partially established).
        mongoose.connection.close();

        // Log the error to standard error output.
        logger.error(`Error: ${error.message}`);

        // Exit the process with a failure code (1) to indicate a fatal error.
        process.exit(1);
    }
};

module.exports = connectToDatabase;
