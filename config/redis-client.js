const redis = require('redis');
const logger = require("../utils/logger");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('connect', () => {
    logger.info('Redis client attempting connection...');
});

redisClient.on('ready', () => {
    logger.info('Redis client is ready to use!');
});

redisClient.on('error', (err) => {
    logger.error('Redis connection error: ', err);
});

module.exports = redisClient; 