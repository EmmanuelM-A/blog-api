const { createPost, getAllPosts, getAllPostsByUser, editPost, deletePost } = require('../../src/api/v1/controllers/post-controller');
const {
    createPostService,
    getAllPostsService,
    getAllPostsByUserService,
    editPostService,
    deletePostService
} = require('../../src/services/posts/post-service');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../src/utils/api-error');

jest.mock('../../src/services/posts/post-service');
jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
}));

describe('Post Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            query: {},
            user: { id: 'user-123', username: 'testuser', role: 'user' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('createPost', () => {
        it('should respond with 201 and the created post on success', async () => {
            req.body = { title: 'New Post', content: 'Some content' };
            const mockPost = { id: 'post-1', title: 'New Post', content: 'Some content' };
            createPostService.mockResolvedValue(mockPost);

            await createPost(req, res, next);

            expect(createPostService).toHaveBeenCalledWith(req.user, req.body);
            expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Post created successfully.',
                data: { createdPost: mockPost }
            });
        });

        it('should pass errors from createPostService to next', async () => {
            const error = new ApiError('Title must not be empty', StatusCodes.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR');
            createPostService.mockRejectedValue(error);

            await createPost(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getAllPosts', () => {
        it('should respond with 200 and posts data', async () => {
            const mockData = { allPosts: [], page: 1, totalPages: 1, totalPosts: 0 };
            getAllPostsService.mockResolvedValue(mockData);

            await getAllPosts(req, res, next);

            expect(getAllPostsService).toHaveBeenCalledWith({ page: undefined, limit: undefined, q: undefined, author: undefined, sort: undefined, tag: undefined });
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
        });

        it('should pass errors to next', async () => {
            const error = new Error('DB error');
            getAllPostsService.mockRejectedValue(error);

            await getAllPosts(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getAllPostsByUser', () => {
        it('should respond with 200 and user posts data', async () => {
            req.params.username = 'testuser';
            const mockData = { userPosts: [], page: 1, totalPages: 1, totalPosts: 0 };
            getAllPostsByUserService.mockResolvedValue(mockData);

            await getAllPostsByUser(req, res, next);

            expect(getAllPostsByUserService).toHaveBeenCalledWith('testuser', { page: undefined, limit: undefined });
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
        });

        it('should pass a 404 error to next if user is not found', async () => {
            req.params.username = 'nobody';
            const error = new ApiError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
            getAllPostsByUserService.mockRejectedValue(error);

            await getAllPostsByUser(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('editPost', () => {
        it('should respond with 200 and updated post on success', async () => {
            req.params.postId = 'post-1';
            req.body = { title: 'Updated', content: 'Updated content' };
            const mockPost = { id: 'post-1', title: 'Updated' };
            editPostService.mockResolvedValue(mockPost);

            await editPost(req, res, next);

            expect(editPostService).toHaveBeenCalledWith(req.user, 'post-1', req.body);
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Post updated successfully.',
                data: { postDB: mockPost }
            });
        });

        it('should pass errors to next', async () => {
            req.params.postId = 'post-1';
            const error = new ApiError('Post not found', StatusCodes.NOT_FOUND, 'POST_NOT_FOUND');
            editPostService.mockRejectedValue(error);

            await editPost(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('deletePost', () => {
        it('should respond with 200 on successful deletion', async () => {
            req.params.postId = 'post-1';
            deletePostService.mockResolvedValue();

            await deletePost(req, res, next);

            expect(deletePostService).toHaveBeenCalledWith(req.user, 'post-1');
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Post deleted successfully.'
            });
        });

        it('should pass errors to next', async () => {
            req.params.postId = 'post-1';
            const error = new ApiError('Forbidden', StatusCodes.FORBIDDEN, 'FORBIDDEN');
            deletePostService.mockRejectedValue(error);

            await deletePost(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
