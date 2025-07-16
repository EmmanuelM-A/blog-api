const { status } = require("../../utils/status"); // Adjust path as needed
const Post = require("../../models/post-schema"); // Adjust path as needed
const Like = require("../../models/like-schema"); // Adjust path as needed
const ApiError = require("../../utils/ApiError"); // Adjust path as needed
const { sendSuccessResponse } = require("../../utils/helpers"); // Adjust path as needed
const { likePost, getLikesForPost } = require("../../controllers/like-controller"); // Adjust path as needed

// Mock logger to prevent console output during tests
jest.mock("../../utils/logger", () => ({
    info: jest.fn(),
    warn: jest.fn(),
}));

// Mock sendSuccessResponse
jest.mock("../../utils/helpers", () => ({
    sendSuccessResponse: jest.fn(),
}));

// Mock Post and Like models
jest.mock("../../models/post-schema", () => ({
    findById: jest.fn(),
}));

jest.mock("../../models/like-schema", () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(), // Added for getLikesForPost
}));

// Mock ApiError
jest.mock("../../utils/ApiError");

describe('Like Controller Tests', () => {
    let mockRequest;
    let mockResponse;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockRequest = {
            params: {},
            user: {
                id: 'mockUserId456'
            }, // Default user for authenticated requests
        };
        next = jest.fn();
    });

    // --- Tests for likePost ---
    describe('likePost', () => {
        it('should like a post for the first time and return 200 with "Post liked." message', async () => {
            mockRequest.params.postId = 'mockPostId123';

            Post.findById.mockResolvedValue({
                _id: 'mockPostId123'
            });

            Like.findOne.mockResolvedValue(null); // No existing like
            Like.create.mockResolvedValue({
                _id: 'newLikeId',
                post_id: 'mockPostId123',
                user_id: 'mockUserId456'
            });

            await likePost(mockRequest, mockResponse, next);

            expect(Post.findById).toHaveBeenCalledWith('mockPostId123');
            expect(Like.findOne).toHaveBeenCalledWith({
                post_id: 'mockPostId123',
                user_id: 'mockUserId456'
            });
            expect(Like.create).toHaveBeenCalledWith({
                post_id: 'mockPostId123',
                user_id: 'mockUserId456'
            });
            expect(sendSuccessResponse).toHaveBeenCalledWith(
                mockResponse,
                status.OK,
                "Post liked."
            );
        });

        it('should unlike an already liked post and return 200 with "Post unliked." message', async () => {
            mockRequest.params.postId = 'mockPostId123';

            Post.findById.mockResolvedValue({
                _id: 'mockPostId123',
                title: 'Test Post'
            });
            const mockExistingLike = {
                _id: 'existingLikeId',
                post_id: 'mockPostId123',
                user_id: 'mockUserId456',
                deleteOne: jest.fn().mockResolvedValue(true),
            };
            Like.findOne.mockResolvedValue(mockExistingLike);

            await likePost(mockRequest, mockResponse, next);

            expect(Post.findById).toHaveBeenCalledWith('mockPostId123');
            expect(Like.findOne).toHaveBeenCalledWith({
                post_id: 'mockPostId123',
                user_id: 'mockUserId456'
            });
            expect(mockExistingLike.deleteOne).toHaveBeenCalledTimes(1);
            expect(Like.create).not.toHaveBeenCalled(); // Ensure create is not called
            expect(sendSuccessResponse).toHaveBeenCalledWith(
                mockResponse,
                status.OK,
                "Post unliked."
            );
        });

        it('should throw ApiError with status 404 if post is not found for like/unlike', async () => {
            mockRequest.params.postId = 'nonExistentPost';
            Post.findById.mockResolvedValue(null); // Post not found

            await likePost(mockRequest, mockResponse, next); // Call the function

            expect(next).toHaveBeenCalledTimes(1); // Expect next to be called once
            const errorPassedToNext = next.mock.calls[0][0]; // Get the error passed to next

            expect(errorPassedToNext).toBeInstanceOf(ApiError); // Ensure it's an ApiError instance
            expect(errorPassedToNext.message).toBe(``);
            expect(errorPassedToNext.statusCode).toBe(status.NOT_FOUND);
            expect(errorPassedToNext.code).toBe("POST_NOT_FOUND");

            expect(sendSuccessResponse).not.toHaveBeenCalled();
            expect(Like.findOne).not.toHaveBeenCalled();
            expect(Like.create).not.toHaveBeenCalled();
        });
    });

    // --- Tests for getLikesForPost ---
    describe('getLikesForPost', () => {
        it('should return likes for a post and return 200 with correct data', async () => {
            const postId = 'mockPostId789';
            mockRequest.params.postId = postId;

            const mockLikes = [{
                _id: 'like1',
                post_id: postId,
                user_id: 'userA'
            }, {
                _id: 'like2',
                post_id: postId,
                user_id: 'userB'
            }, ];

            Post.findById.mockResolvedValue({
                _id: postId,
                title: 'Another Post'
            });
            Like.find.mockResolvedValue(mockLikes);

            await getLikesForPost(mockRequest, mockResponse, next);

            expect(Post.findById).toHaveBeenCalledWith(postId);
            expect(Like.find).toHaveBeenCalledWith({
                post_id: postId
            });
            expect(sendSuccessResponse).toHaveBeenCalledWith(
                mockResponse,
                status.OK,
                "Likes fetched successfully!", {
                    postId,
                    likesCount: mockLikes.length,
                    likes: mockLikes,
                }
            );
        });

        it('should return empty likes array if no likes exist for post', async () => {
            const postId = 'mockPostId101';
            mockRequest.params.postId = postId;

            Post.findById.mockResolvedValue({
                _id: postId,
                title: 'Empty Likes Post'
            });
            Like.find.mockResolvedValue([]); // No likes found

            await getLikesForPost(mockRequest, mockResponse, next);

            expect(Post.findById).toHaveBeenCalledWith(postId);
            expect(Like.find).toHaveBeenCalledWith({
                post_id: postId
            });
            expect(sendSuccessResponse).toHaveBeenCalledWith(
                mockResponse,
                status.OK,
                "Likes fetched successfully!", {
                    postId,
                    likesCount: 0,
                    likes: [],
                }
            );
        });

        it('should throw ApiError with status 404 if post is not found for fetching likes', async () => {
            const postId = 'nonExistentPostForLikes';
            mockRequest.params.postId = postId;

            Post.findById.mockResolvedValue(null); // Post not found

            await expect(getLikesForPost(mockRequest, mockResponse, next)).rejects.toThrow(ApiError);
            expect(ApiError).toHaveBeenCalledWith(
                `Post with id ${postId} not found.`,
                status.NOT_FOUND,
                "POST_NOT_FOUND"
            );
            expect(sendSuccessResponse).not.toHaveBeenCalled();
            expect(Like.find).not.toHaveBeenCalled();
        });
    });
});