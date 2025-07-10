const redisClient = require("../caching/redis-client");
const logger = require("../../utils/logger");


/**
 * @function clearCacheForKey
 * @description
 * Asynchronously clears all cached Redis keys matching the provided pattern.
 * Useful for maintaining cache consistency after creating, editing, or deleting posts,
 * or for any other cache group identified by the key pattern.
 *
 * @param {string} keyPattern - The Redis key pattern to match (e.g., 'posts:page:*').
 * @returns {Promise<void>} Resolves when all matching cache keys have been deleted.
 * @example
 * await clearCacheForKey('posts:page:*');
 */
const clearCacheForKey = async (keyPattern) => {
    const keys = await redisClient.keys(keyPattern);
    if (keys.length) {
        await Promise.all(keys.map(k => redisClient.del(k)));
        logger.info(`Cleared ${keys.length} cached pages for the keys: ${keyPattern}.`);
    }
};

module.exports = { clearCacheForKey };