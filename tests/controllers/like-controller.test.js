const { likePost, getLikesForPost } = require('../../src/api/v1/controllers/like-controller');
const { toggleLikeService, getLikesForPostService } = require('../../src/services/likes/like-service');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../src/utils/api-error');

jest.mock('../../src/services/likes/like-service');
jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
}));

describe('Like Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: { postId: 'post-123' },
            user: { id: 'user-456' },
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('likePost', () => {
        it('should respond with 200 and "liked" message when a post is liked', async () => {
            toggleLikeService.mockResolvedValue('liked');

            await likePost(req, res, next);

            expect(toggleLikeService).toHaveBeenCalledWith('post-123', 'user-456');
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Post liked!'
            });
        });

        it('should respond with 200 and "unliked" message when a post is unliked', async () => {
            toggleLikeService.mockResolvedValue('unliked');

            await likePost(req, res, next);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Post unliked!'
            });
        });

        it('should pass a 404 error to next if the post is not found', async () => {
            const error = new ApiError('Post not found', StatusCodes.NOT_FOUND, 'POST_NOT_FOUND');
            toggleLikeService.mockRejectedValue(error);

            await likePost(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getLikesForPost', () => {
        it('should respond with 200 and paginated likes data', async () => {
            const mockLikesData = {
                likes: [{ _id: 'like1', user_id: 'user-456' }],
                likesCount: 1,
                page: 1,
                totalPages: 1
            };
            getLikesForPostService.mockResolvedValue(mockLikesData);

            await getLikesForPost(req, res, next);

            expect(getLikesForPostService).toHaveBeenCalledWith('post-123', { page: undefined, limit: undefined });
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Likes fetched successfully!',
                data: { postId: 'post-123', ...mockLikesData }
            });
        });

        it('should pass a 404 error to next if the post is not found', async () => {
            const error = new ApiError('Post not found', StatusCodes.NOT_FOUND, 'POST_NOT_FOUND');
            getLikesForPostService.mockRejectedValue(error);

            await getLikesForPost(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
