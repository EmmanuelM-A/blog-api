const { clearPostCache } = require('../../utils/cache-utils');
const redisClient = require('../../config/redis-client');

jest.mock('../../config/redis-client', () => ({
    keys: jest.fn(),
    del: jest.fn()
}));

describe('clearPostCache', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete all matching cache keys for the given pattern', async () => {
        redisClient.keys.mockResolvedValue(['posts:page:1', 'posts:page:2']);
        redisClient.del.mockResolvedValue(1);

        await clearPostCache('posts:page:*');

        expect(redisClient.keys).toHaveBeenCalledWith('posts:page:*');
        expect(redisClient.del).toHaveBeenCalledTimes(2);
        expect(redisClient.del).toHaveBeenCalledWith('posts:page:1');
        expect(redisClient.del).toHaveBeenCalledWith('posts:page:2');
    });

    it('should do nothing if no keys are found', async () => {
        redisClient.keys.mockResolvedValue([]);

        await clearPostCache('posts:page:*');

        expect(redisClient.keys).toHaveBeenCalledWith('posts:page:*');
        expect(redisClient.del).not.toHaveBeenCalled();
    });
});