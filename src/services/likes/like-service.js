const { StatusCodes } = require("http-status-codes");
const logger = require("../../utils/logger");
const { findPostById } = require("../../database/models/post-model");
const { createLike, findLikeByCriteria, deleteLikeById, findLikes } = require("../../database/models/like-model");
const ApiError = require("../../utils/api-error");

/**
 * Toggles a like for a post by a user. If the user has already liked the post, it will 
 * unlike (remove the like). If not, it will add a like.
 * 
 * @param {string} postId - The ID of the post to like/unlike.
 * @param {string} userId - The ID of the user performing the action.
 * 
 * @returns {Promise<string>} - "liked" or "unliked"
 * 
 * @throws {ApiError} If the post does not exist.
 */
async function toggleLikeService(postId, userId) {
    // Log the intent to like/unlike a post
    logger.debug(`User ${userId} attempting to like/unlike the post ${postId}`);
    
    // Check if the post exists
    const post = await findPostById(postId);
    if (!post) {
        logger.warn(`Post with id ${postId} not found for like/unlike.`);
        throw new ApiError(
            `Post with id ${postId} not found.`,
            StatusCodes.NOT_FOUND,
            "POST_NOT_FOUND"
        );
    }

    // Check if the user already liked this post
    const existingLike = await findLikeByCriteria({ post_id: postId, user_id: userId });

    if (existingLike) {
        await deleteLikeById(existingLike._id);
        logger.debug(`User ${userId} unliked post ${postId}`);
        return "unliked";
    } else {
        await createLike({ post_id: postId, user_id: userId });
        logger.debug(`User ${userId} liked post ${postId}`);
        return "liked";
    }
}

/**
 * Retrieves all likes for a specific post.
 * 
 * @param {string} postId - The ID of the post.
 * @returns {Promise<{ postId: string, likesCount: number, likes: Array }>}
 * @throws {ApiError} If the post does not exist.
 */
async function getLikesForPostService(postId) {
    // Log the retrieval attempt
    logger.debug(`Fetching likes for the post: ${postId}`);

    // Check if the post exists
    const post = await findPostById(postId);
    if (!post) {
        logger.warn(`Post with id ${postId} not found when fetching likes.`);
        throw new ApiError(
            `Post with id ${postId} not found.`,
            StatusCodes.NOT_FOUND,
            "POST_NOT_FOUND"
        );
    }

    // Retrieve all like documents associated with the post
    const likes = await findLikes({ post_id: postId });

    logger.debug(`Fetched ${likes.length} likes for post: ${postId}`);
    
    return {
        likesCount: likes.length,
        likes
    };
}

module.exports = {
    toggleLikeService,
    getLikesForPostService,
};