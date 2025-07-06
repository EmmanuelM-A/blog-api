require('dotenv').config();

const app = require('./app');
const connectToDatabase = require("./database/database-connection");
const logger = require('./utils/logger');
const redisClient = require('./services/caching/redis-client');
const setupSwagger = require('./docs/swagger');
const { constants } = require('./config');

const PORT = process.env.PORT || constants.DEFAULT_PORT;

// --------------------- Application Startup Logic ---------------------

async function startServer() {
    try {
        // Connect to Database
        await connectToDatabase();

        // Connect to Redis
        await redisClient.connect();

        // Mount Swagger at /api-docs
        await setupSwagger(app);

        // Start the Express server
        app.listen(PORT, "0.0.0.0", () => {
            logger.info(`Server running on port ${PORT} at http://localhost:${PORT}`);
        });

    } catch (error) {
        logger.error('Failed to start application:', error);
        process.exit(1);
    }
}

startServer();

// --------------------- Graceful Shutdown ---------------------

/**
 * This ensures that when the server is stopped (e.g., by Ctrl+C or a SIGTERM signal from Docker), it gracefully closes connections to 
 * Redis and potentially your database.
 */

process.on('SIGINT', async () => {
    logger.info('SIGINT signal received. Shutting down gracefully...');
    await shutdown();
});

process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received. Shutting down gracefully...');
    await shutdown();
});

async function shutdown() {
    try {
        // Close Redis connection
        if (redisClient.isReady) { // Only quit if it's connected
            await redisClient.quit();
            logger.info('Redis connection closed.');
        }

        // Close database connectio
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            logger.info('Database connection closed.');
        }

        logger.info('Application shut down.');
        process.exit(0);
    } catch (err) {
        logger.error('Error during graceful shutdown:', err);
        process.exit(1);
    }
}