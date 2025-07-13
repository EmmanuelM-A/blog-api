const expressAsyncHandler = require("express-async-handler");
const logger = require("../../../utils/logger");
const { sendSuccessResponse } = require("../../../utils/helpers");
const { deletePostService, editPostService, getAllPostsByUserService, createPostService, getAllPostsService } = require("../../../services/posts/post-service");
const { StatusCodes } = require("http-status-codes");
const { countPostsByCriteria, findPostByCriteria, findPosts } = require("../../../database/models/post-model");


/**
 * @function createPost
 * @description
 * Handles an HTTP POST request to create a new blog post.
 * Requires an authenticated user identified by `author_id` query parameter.
 * Validates input data (title and content), enforces length limits,
 * clears any relevant cache, and stores the post in the database.
 *
 * @route POST /api/posts
 * @access Private
 *
 * @param {import('express').Request} request - Express request object. 
 *   Expects `title` and `content` in the JSON body, and `author_id` as a query parameter.
 * @param {import('express').Response} response - Express response object used to return the created post.
 *
 * @returns {Response} 201 - Returns the created post object on success.
 * @returns {Response} 401 - If `author_id` is missing, meaning unauthorized.
 * @returns {Response} 404 - If no user is found for the provided `author_id`.
 * @returns {Response} 422 - For validation errors like missing or invalid fields.
 *
 * @throws {Error} Throws errors for missing user, validation failures, or unauthorized access (handled by expressAsyncHandler).
 *
 * @example
 * // Client request:
 * POST /api/posts?author_id=609d6c9b3f1d2b001f89f100
 * {
 *   "title": "My First Post",
 *   "content": "This is the content of my first post."
 * }
 *
 * // Sample response:
 * {
 *   "post": {
 *     "_id": "60a6b9d4f1e9a21e4cfa1234",
 *     "title": "My First Post",
 *     "content": "This is the content of my first post.",
 *     "author_id": "609d6c9b3f1d2b001f89f100",
 *     "createdAt": "2024-06-25T10:20:30Z",
 *     "updatedAt": "2024-06-25T10:20:30Z"
 *   }
 * }
 */
const createPost = expressAsyncHandler(async (request, response) => {
    const createdPost = await createPostService(request.user, request.body);

    sendSuccessResponse(
        response,
        StatusCodes.CREATED,
        "Post created successfully.",
        { createdPost }
    );

    // Log success and respond with the created post object
    logger.info(`New post created by user ${request.user.username} with ID: ${post.id}`);
});


/**
 * @function getAllPosts
 * @description
 * Retrieves paginated blog posts with Redis caching to improve performance.
 * If cached data exists for the requested page, it returns that.
 * Otherwise, fetches from MongoDB, caches the result, and returns it.
 *
 * @route GET /api/posts
 * @access Public
 *
 * @param {import('express').Request} request - Express request object, expects optional query parameter `page` (default 1).
 * @param {import('express').Response} response - Express response object used to return paginated posts.
 *
 * @returns {Response} 200 - Returns an object with posts for the page, total pages, and total post count.
 *
 * @example
 * // Client request:
 * GET /api/posts?page=2
 *
 * // Sample response:
 * {
 *   "allPosts": [],
 *   "page": 2,
 *   "totalPages": 10,
 *   "totalPosts": 100
 * }
 */
const getAllPosts = expressAsyncHandler(async (request, response) => {
    // Parse query parameters
    const page = request.query.page;
    const limit = request.query.limit;

    const responseData = await getAllPostsService({ page, limit });

    sendSuccessResponse(
        response,
        StatusCodes.OK,
        "Posts fetched successfully.",
        responseData
    );
});


/**
 * @function getAllPostsByUser
 * @description
 * Retrieves paginated blog posts authored by a specific user, identified by username.
 * Uses Redis to cache responses for performance optimization.
 *
 * @route GET /api/posts/user/:username
 * @access Public
 *
 * @param {import('express').Request} request - Express request object
 * @param {import('express').Response} response - Express response object
 */
const getAllPostsByUser = expressAsyncHandler(async (request, response) => {
    const { username } = request.params;
    const page = request.query.page;
    const limit = request.query.limit;

    const responseData = await getAllPostsByUserService(username, { page, limit});

    sendSuccessResponse(
        response,
        StatusCodes.OK,
        `Posts for user ${username} on page ${page} fetched successfully!`,
        responseData
    );
});

/**
 * @function editPost
 * @description
 * Allows an authenticated user to edit their own blog post by providing a new title and content.
 * Validates ownership, input types, character limits, and ensures the post exists before updating.
 * Clears the cache after a successful edit to keep data fresh.
 *
 * @route PATCH /api/posts/:postId
 * @access Private
 *
 * @param {import('express').Request} request - Express request object containing:
 *    - postId in `params`
 *    - updated `title` and `content` in `body`
 *    - authenticated user's ID in `request.user.id`
 * @param {import('express').Response} response - Express response object used to send back updated post data.
 *
 * @returns {Response} 200 - Success message with updated post object.
 *
 * @throws {Error}
 *    - 401 UNAUTHORIZED if user is not authenticated.
 *    - 403 FORBIDDEN if the user is not the author of the post.
 *    - 404 NOT_FOUND if the post does not exist.
 *    - 422 VALIDATION_ERROR if input is invalid or exceeds max limits.
 *
 * @example
 * // Client request:
 * PATCH /api/posts/abc123
 * {
 *   "title": "Updated Post Title",
 *   "content": "Updated post content."
 * }
 *
 * // Sample response:
 * {
 *   "message": "Post updated successfully.",
 *   "post": { ...updated post object... }
 * }
 */
const editPost = expressAsyncHandler(async (request, response) => {
    const { postId } = request.params;
    const user = request.user;

    const postDB = await editPostService(user, postId, request.body);

    sendSuccessResponse(
        response,
        StatusCodes.OK,
        "Post updated successfully.",
        { postDB }
    );

    logger.info(`Post ${postId} edited by user ${postDB.id}.`);
});


/**
 * @function deletePost
 * @description
 * Allows an authenticated user to delete one of their own blog posts.
 * Validates authentication and post ownership, and ensures the post exists before deletion.
 * Clears cached post data after deletion to maintain consistency.
 *
 * @route DELETE /api/posts/:postId
 * @access Private
 *
 * @param {import('express').Request} request - Express request object containing:
 *    - postId in `params`
 *    - authenticated user's ID in `request.user.id`
 * @param {import('express').Response} response - Express response object used to send confirmation.
 *
 * @returns {Response} 200 - Success message indicating the post was deleted.
 *
 * @throws {Error}
 *    - 401 UNAUTHORIZED if the user is not authenticated.
 *    - 403 FORBIDDEN if the user is not the author of the post.
 *    - 404 NOT_FOUND if the post does not exist.
 *
 * @example
 * // Client request:
 * DELETE /api/posts/abc123
 *
 * // Sample response:
 * {
 *   "message": "Post deleted successfully."
 * }
 */
const deletePost = expressAsyncHandler( async (request, response) => {
    const { postId } = request.params;
    const user = request.user;

    await deletePostService(user, postId);
    
    sendSuccessResponse(
        response,
        StatusCodes.OK,
        "Post deleted successfully."
    );

    logger.info(`Post ${postId} deleted by user ${userId}.`);
});

module.exports = { getAllPosts, getAllPostsByUser, createPost, editPost, deletePost };