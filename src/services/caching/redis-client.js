const redis = require('redis');
const logger = require("../utils/logger");

/**
 * @constant {RedisClientType}
 * @description
 * Initializes and exports a Redis client configured to connect using a URL defined
 * in the environment variable `REDIS_URL`. This client uses event listeners to log
 * the lifecycle of the Redis connection: when it's attempting to connect, ready for use,
 * or when errors occur.
 *
 * This client should be imported and used across the application for caching,
 * session storage, rate limiting, or other Redis-based features.
 *
 * @requires redis
 * @requires logger
 */
const redisClient = redis.createClient({
    url: process.env.REDIS_URL, // Redis connection URL
});

// Event: Fired when the client is initiating a connection to Redis.
redisClient.on('connect', () => {
    logger.info('Redis client attempting connection...');
});

// Event: Fired once the Redis client has successfully connected and is ready to use.
redisClient.on('ready', () => {
    logger.info('Redis client is ready to use!');
});

// Event: Fired when there is an error with the Redis connection or during operations.
// It helps in diagnosing issues like invalid URL, authentication errors, or network issues.
redisClient.on('error', (err) => {
    logger.error('Redis connection error: ', err);
});

module.exports = redisClient;