const redisClient = require("../config/redis-client");

const clearPostCache = async () => {
    const keys = await redisClient.keys('posts:page:*');
    if (keys.length) {
        await Promise.all(keys.map(k => redisClient.del(k)));
        console.log(`Cleared ${keys.length} cached pages of posts`);
    }
};

module.exports = { clearPostCache };