const logger = require("../../../utils/logger");
const { sendSuccessResponse } = require("../../../utils/helpers");
const { toggleLikeService, getLikesForPostService } = require("../../../services/likes/like-service");
const { StatusCodes } = require("http-status-codes");
const expressAsyncHandler = require("express-async-handler");

/**
 * Handles an HTTP POST request to like or unlike a post.
 * 
 * @route POST /api/posts/like/:postId
 * 
 * @access Private (Authenticated users only)
 *
 * @returns {Response} 200 - Returns success message indicating whether the post was liked or unliked.
 * @returns {Response} 404 - If the specified post is not found.
 *
 */
const likePost = expressAsyncHandler(async (request, response) => {
    // Extract postId from request parameters and user ID from the request object
    const { postId } = request.params;
    const userId = request.user?.id;

    const resultMsg = await toggleLikeService(postId, userId);

    sendSuccessResponse(response, StatusCodes.OK, `Post ${resultMsg}!`);
});

/**
 * Handles an HTTP GET request to retrieve all likes associated with a specific post.
 * 
 * @route GET /api/posts/likes/:postId
 * 
 * @access Public
 *
 * @returns {Response} 200 - Returns the number of likes and like data for the specified post.
 * @returns {Response} 404 - If the post with the specified ID is not found.
 *
 */
const getLikesForPost = expressAsyncHandler(async (request, response) => {
    // Extract postId from request parameters
    const { postId } = request.params;

    const { likesCount, likes } = await getLikesForPostService(postId);

    sendSuccessResponse(
        response, 
        StatusCodes.OK, 
        "Likes fetched successfully!", 
        {
            postId,
            likesCount,
            likes
        }
    );

    logger.info(`Fetched ${likesCount} likes for post: ${postId}`);
});

module.exports = {
    likePost,
    getLikesForPost
};