const redis = require('redis');
const logger = require("../utils/logger");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('connect', () => {
    logger.info('Connected to Redis!');
});

redisClient.on('error', (err) => {
  logger.error('Redis error: ', err);
});

await redisClient.connect();

module.exports = redisClient; 