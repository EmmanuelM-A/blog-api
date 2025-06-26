const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const Post = require("../models/post-schema");
const Comment = require("../models/comment-schema");
const logger = require("../utils/logger");
const { constants } = require("../utils/constants");
const ApiError = require("../utils/ApiError");
const { sendSuccessResponse } = require("../utils/helpers");

/**
 * @function commentOnPost
 * @description
 * Handles an HTTP POST request to add a comment to a post. Only authenticated users can comment. 
 * Validates that the comment is a non-empty string and enforces a maximum character length. 
 * If the post doesn't exist, a 404 response is returned. Logs all key actions for monitoring and auditing.
 *
 * @route POST /api/posts/comment/:postId
 * @access Private (Authenticated users only)
 *
 * @param {import('express').Request} request - Express request object containing the post ID as a URL parameter, the user object (from auth middleware), and the comment in the body.
 * @param {import('express').Response} response - Express response object used to return the result of the operation.
 *
 * @returns {Response} 200 - If the comment is successfully added.
 * @returns {Response} 400 - If the comment is invalid or exceeds character limits.
 * @returns {Response} 401 - If the user is not authenticated.
 * @returns {Response} 404 - If the specified post does not exist.
 *
 * @throws {Error} - Throws detailed errors for validation, authentication, and missing post cases, handled by global error middleware.
 */
const commentOnPost = asyncHandler(async (request, response) => {
    // Extract all the details needed for commenting
    const { postId } = request.params;
    const userId = request.user?.id;
    const { comment } = request.body;

    // Check if the user is authenticated
    if (!userId) {
        logger.warn("Unauthorized attempt to comment on post.");

        throw new ApiError(
            "Authentication required to comment on a post.",
            status.UNAUTHORIZED,
            "UNAUTHORIZED"
        );
    }

    // Validate comment: must be a non-empty string
    if (typeof comment !== "string" || !comment.trim()) {
        logger.error("Invalid or empty comment.");

        throw new ApiError(
            "Comment must be a non-empty string.",
            status.VALIDATION_ERROR,
            "INVALID_COMMENT"
        );
    }

    // Trim whitespace from the comment.
    const trimmedComment = comment.trim();

    // If the comment is empty after trimming, it is considered invalid.
    if (trimmedComment.length === 0) {
        logger.error("Comment is empty after trimming.");
        
        throw new ApiError(
            "Comment cannot be empty!",
            status.VALIDATION_ERROR,
            "EMPTY_COMMENT"
        );
    }

    // Enforce max character limit on comment
    if (trimmedComment.length > constants.MAX_CHAR_COMMENT_LENGTH) {
        logger.error(`Comment exceeds ${constants.MAX_CHAR_COMMENT_LENGTH} characters.`);

        throw new ApiError(
            `Comment exceeds the maximum allowed length of ${constants.MAX_CHAR_COMMENT_LENGTH} characters.`,
            status.VALIDATION_ERROR,
            "COMMENT_TOO_LONG",
        );
    }

    // Retrieve the post from the database
    const post = await Post.findById(postId);

    // Check if the post exists
    if (!post) {
        logger.warn(`Comment failed: Post with id ${postId} not found.`);

        throw new ApiError(
            "Comment failed: Post with id ${postId} not found.",
            status.NOT_FOUND,
            "POST_NOT_FOUND"
        );
    }

    // Log the commenting attempt
    logger.info(`Comment creation attempt by the user: ${request.user.username} (${userId})`);

    // Create and save the comment
    const commentForPost = await Comment.create({
        content: trimmedComment,
        post_id: postId,
        user_id: userId
    });

    sendSuccessResponse(
        response,
        status.CREATED,
        "Comment added successfully.",
    );

    // Log successful comment creation
    logger.info(`The comment with the comment_id: ${commentForPost.id} created successfully by the user: ${request.user.username} (${userId})`);
});

/**
 * @function getCommentsForPost
 * @description
 * Handles an HTTP GET request to retrieve all comments associated with a specific post.
 * Fetches the post by ID to validate its existence, then queries and returns all associated comments.
 * Comments are sorted by creation date in descending order and populated with the commenter's username.
 * Intended for public access; no authentication required.
 *
 * @route GET /api/posts/comments/:postId
 * @access Public
 *
 * @param {import('express').Request} request - Express request object, containing `postId` as a URL parameter.
 * @param {import('express').Response} response - Express response object used to return the post's comments or an error.
 *
 * @returns {Response} 200 - Returns an array of comments with user information if found.
 * @returns {Response} 404 - If the specified post is not found.
 *
 * @throws {Error} - Throws a descriptive error if the post does not exist (handled by asyncHandler).
 *
 * @example
 * // Client request:
 * GET /api/posts/comments/609d6c9b3f1d2b001f89f100
 *
 * // Sample response:
 * {
 *   "postId": "609d6c9b3f1d2b001f89f100",
 *   "comments": [
 *     {
 *       "_id": "64a5f10eaa1234567890abc1",
 *       "content": "Great post!",
 *       "user_id": { "username": "johndoe" },
 *       "createdAt": "2025-06-24T10:00:00.000Z",
 *       ...
 *     }
 *   ]
 * }
 */
const getCommentsForPost = asyncHandler(async (request, response) => {
    // Extract the postId from the request parameters
    const { postId } = request.params;

    // Log the request attempt
    logger.info(`Fetching comments for post: ${postId}`);

    // Check if the post exists before fetching comments
    const post = await Post.findById(postId);
    if (!post) {
        logger.warn(`Post with id ${postId} not found when fetching comments.`);
        throw new ApiError(
            `Post with id ${postId} not found.`,
            status.NOT_FOUND,
            "POST_NOT_FOUND"
        );
    }

    // Fetch comments associated with the post
    const comments = await Comment.find({ post_id: postId })
        .sort({ createdAt: -1 }) // Sort newest to oldest
        .populate("user_id", "username"); // Include only the username of the commenter

    sendSuccessResponse(
        response,
        status.OK,
        "Comments fetched successfully.",
        { postId, comments }
    );

    logger.info(`Fetched ${comments.length} comments for post: ${postId}`);
});

module.exports = { 
    commentOnPost,
    getCommentsForPost
};