const logger = require("../../../utils/logger");
const { sendSuccessResponse } = require("../../../utils/helpers");
const expressAsyncHandler = require("express-async-handler");
const { commentOnPostService, getCommentsForPostService } = require("../../../services/comments/comment-service");
const { StatusCodes } = require("http-status-codes");

/**
 * Handles an HTTP POST request to add a comment to a post.
 *
 * @route POST /api/posts/comment/:postId
 * @access Private (Authenticated users only)
 *
 * @returns {Response} 200 - If the comment is successfully added.
 * @returns {Response} 400 - If the comment is invalid or exceeds character limits.
 * @returns {Response} 401 - If the user is not authenticated.
 * @returns {Response} 404 - If the specified post does not exist.
 */
const commentOnPost = expressAsyncHandler(async (request, response) => {
    // Extract all the details needed for commenting
    const { postId } = request.params;
    const userId = request.user?.id;
    const { comment } = request.body;

    await commentOnPostService(postId, userId, comment);

    sendSuccessResponse(
        response,
        StatusCodes.CREATED,
        "Comment added successfully.",
    );

    logger.info(`The comment with the comment_id: ${commentForPost.id} created successfully by the user: ${request.user.username} (${userId})`);
});

/**
 * Handles an HTTP GET request to retrieve all comments associated with a specific post.
 *
 * @route GET /api/posts/comments/:postId
 *
 * @returns {Response} 200 - Returns an array of comments with user information if found.
 * @returns {Response} 404 - If the specified post is not found.
 *
 */
const getCommentsForPost = expressAsyncHandler(async (request, response) => {
    // Extract the postId from the request parameters
    const { postId } = request.params;
    const { page, limit } = request.query;

    const { comments, currPage, totalPages, totalComments } = await getCommentsForPostService(postId, { page, limit });

    sendSuccessResponse(
        response,
        StatusCodes.OK,
        "Comments fetched successfully.",
        {
            postId,
            comments,
            currPage,
            totalPages,
            totalComments
        }
    );

    logger.info(`Fetched ${comments.length} comments for the post: ${postId}`);
});

module.exports = { 
    commentOnPost,
    getCommentsForPost
};