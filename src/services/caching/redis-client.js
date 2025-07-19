const redis = require('redis');
const logger = require("../../utils/logger");

const REDIS_URL = process.env.NODE_ENV === "development" ? process.env.DEV_REDIS_URL : process.env.PROD_REDIS_URL;

/**
 * Initializes and exports a Redis client configured to connect using a URL defined
 * in the environment variable `REDIS_URL`.
 */
const redisClient = redis.createClient({
    url: REDIS_URL, // Redis connection URL
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