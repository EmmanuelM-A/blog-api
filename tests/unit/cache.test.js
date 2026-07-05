const { clearCacheForKey } = require('../../src/services/caching/cache-utils');
const redisClient = require('../../src/services/caching/redis-client');

jest.mock('../../src/services/caching/redis-client', () => ({
    keys: jest.fn(),
    del: jest.fn()
}));

jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
}));

describe('clearCacheForKey', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete all matching cache keys for the given pattern', async () => {
        redisClient.keys.mockResolvedValue(['posts:page:1', 'posts:page:2']);
        redisClient.del.mockResolvedValue(1);

        await clearCacheForKey('posts:page:*');

        expect(redisClient.keys).toHaveBeenCalledWith('posts:page:*');
        expect(redisClient.del).toHaveBeenCalledTimes(2);
        expect(redisClient.del).toHaveBeenCalledWith('posts:page:1');
        expect(redisClient.del).toHaveBeenCalledWith('posts:page:2');
    });

    it('should do nothing if no keys are found', async () => {
        redisClient.keys.mockResolvedValue([]);

        await clearCacheForKey('posts:page:*');

        expect(redisClient.keys).toHaveBeenCalledWith('posts:page:*');
        expect(redisClient.del).not.toHaveBeenCalled();
    });
});
