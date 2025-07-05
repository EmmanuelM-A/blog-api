const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const Post = require("../models/post-schema");
const User = require("../models/user-schema");
const Like = require("../models/like-schema"); 
const logger = require("../utils/logger");
const { constants } = require("../utils/constants");
const ApiError = require("../utils/ApiError");
const { sendSuccessResponse } = require("../utils/helpers");

/**
 * @function likePost
 * @description
 * Handles an HTTP POST request to like or unlike a post.
 * If the user has already liked the post, this action will remove the like (unlike).
 * If the user hasn't liked the post, it will add a like.
 * Useful for implementing toggle-style like buttons in frontend applications.
 *
 * @route POST /api/posts/like/:postId
 * @access Private (Authenticated users only)
 *
 * @param {import('express').Request} request - Express request object containing `postId` in URL params and authenticated user info.
 * @param {import('express').Response} response - Express response object used to send success messages.
 *
 * @returns {Response} 200 - Returns success message indicating whether the post was liked or unliked.
 * @returns {Response} 404 - If the specified post is not found.
 *
 * @throws {Error} - Throws an error if the post does not exist or database operations fail (caught by asyncHandler).
 *
 * @example
 * // Client request:
 * POST /api/posts/like/609d6c9b3f1d2b001f89f100
 *
 * // Response if liked:
 * { "message": "Post liked." }
 *
 * // Response if unliked:
 * { "message": "Post unliked." }
 */
const likePost = asyncHandler(async (request, response) => {
    // Extract postId from request parameters and user ID from the request object
    const { postId } = request.params;
    const userId = request.user?.id;

    // Log the intent to like/unlike a post
    logger.info(`User ${userId} attempting to like/unlike the post ${postId}`);

    // Check if the post exists in the database
    const post = await Post.findById(postId);
    if (!post) {
        logger.warn(`Post with id ${postId} not found for like/unlike.`);

        throw new ApiError(
            `Post with id ${postId} not found.`,
            status.NOT_FOUND,
            "POST_NOT_FOUND"
        );
    }

    // Check if the user already liked this post
    const existingLike = await Like.findOne({ post_id: postId, user_id: userId });

    if (existingLike) {
        // If like exists, remove it (unlike action)
        await existingLike.deleteOne();
        logger.info(`User ${userId} unliked post ${postId}`);

        sendSuccessResponse(response, status.OK, "Post unliked.");
    } else {
        // If like doesn't exist, create a new like
        await Like.create({ post_id: postId, user_id: userId });
        logger.info(`User ${userId} liked post ${postId}`);

        sendSuccessResponse(response, status.OK, "Post liked.");
    }
});

/**
 * @function getLikesForPost
 * @description
 * Handles an HTTP GET request to retrieve all likes associated with a specific post.
 * This endpoint is publicly accessible and returns the total number of likes along with like details.
 *
 * @route GET /api/posts/likes/:postId
 * @access Public
 *
 * @param {import('express').Request} request - Express request object containing the post ID in route parameters.
 * @param {import('express').Response} response - Express response object used to return the like data.
 *
 * @returns {Response} 200 - Returns the number of likes and like data for the specified post.
 * @returns {Response} 404 - If the post with the specified ID is not found.
 *
 * @throws {Error} - Throws an error if the post is not found (handled by asyncHandler).
 *
 * @example
 * // Client request:
 * GET /api/posts/likes/609d6c9b3f1d2b001f89f100
 *
 * // Sample response:
 * {
 *   "postId": "609d6c9b3f1d2b001f89f100",
 *   "likesCount": 3,
 *   "likes": [
 *     { "_id": "...", "post_id": "...", "user_id": "...", ... },
 *     ...
 *   ]
 * }
 */
const getLikesForPost = asyncHandler(async (request, response) => {
    // Extract postId from request parameters
    const { postId } = request.params;

    // Log the retrieval attempt
    logger.info(`Fetching likes for the post: ${postId}`);

    // Validate that the post exists
    const post = await Post.findById(postId);
    if (!post) {
        logger.warn(`Post with id ${postId} not found when fetching likes.`);

        throw new ApiError(
            `Post with id ${postId} not found.`,
            status.NOT_FOUND,
            "POST_NOT_FOUND"
        );
    }

    // Retrieve all like documents associated with the post
    const likes = await Like.find({ post_id: postId });

    sendSuccessResponse(
        response, 
        status.OK, 
        "Likes fetched successfully!", 
        {
            postId,
            likesCount: likes.length,
            likes
        }
    );

    logger.info(`Fetched ${likes.length} likes for post: ${postId}`);
});

module.exports = {
    likePost,
    getLikesForPost
};