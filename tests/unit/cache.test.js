const { clearCacheForKey } = require('../../src/services/caching/cache-utils');
const redisClient = require('../../src/services/caching/redis-client');

jest.mock('../../src/services/caching/redis-client', () => ({
    scanIterator: jest.fn(),
    del: jest.fn()
}));

jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
}));

const mockScanBatches = (batches) => {
    redisClient.scanIterator.mockImplementation(async function* () {
        for (const batch of batches) {
            yield batch;
        }
    });
};

describe('clearCacheForKey', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete all matching cache keys for the given pattern', async () => {
        mockScanBatches([['posts:page:1', 'posts:page:2'], ['posts:page:3']]);
        redisClient.del.mockResolvedValue(1);

        await clearCacheForKey('posts:page:*');

        expect(redisClient.scanIterator).toHaveBeenCalledWith(
            expect.objectContaining({ MATCH: 'posts:page:*' })
        );
        expect(redisClient.del).toHaveBeenCalledTimes(2);
        expect(redisClient.del).toHaveBeenCalledWith(['posts:page:1', 'posts:page:2']);
        expect(redisClient.del).toHaveBeenCalledWith(['posts:page:3']);
    });

    it('should skip empty scan batches', async () => {
        mockScanBatches([[], ['posts:page:1'], []]);
        redisClient.del.mockResolvedValue(1);

        await clearCacheForKey('posts:page:*');

        expect(redisClient.del).toHaveBeenCalledTimes(1);
        expect(redisClient.del).toHaveBeenCalledWith(['posts:page:1']);
    });

    it('should do nothing if no keys are found', async () => {
        mockScanBatches([]);

        await clearCacheForKey('posts:page:*');

        expect(redisClient.scanIterator).toHaveBeenCalled();
        expect(redisClient.del).not.toHaveBeenCalled();
    });
});
