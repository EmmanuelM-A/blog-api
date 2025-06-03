const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const Post = require("../models/post-schema");
const User = require("../models/user-schema");
const Like = require("../models/like-schema"); 
const logger = require("../utils/logger");
const { constants } = require("../utils/constants");


/**
 * @description Like/Unlike a post.
 * @route POST api/posts/like/:postId
 * @access Private
 */
const likePost = asyncHandler( async (request, response) => {
    const { postId } = request.params;
    const userId = request.user?.id;

    logger.info(`User ${userId} attempting to like/unlike the post ${postId}`);

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
        logger.warn(`Post with id ${postId} not found for like/unlike.`);
        response.status(status.NOT_FOUND);
        throw new Error("Post not found.");
    }

    // Check if like already exists
    const existingLike = await Like.findOne({ post_id: postId, user_id: userId });

    if (existingLike) {
        // Unlike (remove like)
        await existingLike.deleteOne();
        logger.info(`User ${userId} unliked post ${postId}`);
        return response.status(status.OK).json({ message: "Post unliked." });
    } else {
        // Like (add like)
        await Like.create({ post_id: postId, user_id: userId });
        logger.info(`User ${userId} liked post ${postId}`);
        return response.status(status.OK).json({ message: "Post liked." });
    }
});

/**
 * @description Get the likes associated with a post.
 * @route GET api/posts/likes/:postId
 * @access Public
 */
const getLikesForPost = asyncHandler( async (request, response) => {
    const { postId } = request.params;

    logger.info(`Fetching likes for the post: ${postId}`);

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
        logger.warn(`Post with id ${postId} not found when fetching likes.`);
        response.status(status.NOT_FOUND);
        throw new Error("Post not found.");
    }

    // Fetch likes
    const likes = await Like.find({ post_id: postId });

    logger.info(`Fetched ${likes.length} likes for post: ${postId}`);

    response.status(status.OK).json({
        postId,
        likesCount: likes.length,
        likes
    });
});

module.exports = {
    likePost,
    getLikesForPost
};