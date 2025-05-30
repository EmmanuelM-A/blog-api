const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const Post = require("../models/post-schema");
const User = require("../models/user-schema"); 
const logger = require("../utils/logger");
const { constants } = require("../utils/constants");

/**
 * @description Comment on a post.
 * @route POST api/posts/:id/comment
 * @access public
 */
const commentOnPost = asyncHandler( async (request, response) => {
    const postId = request.params.id;
    const userId = request.params.id;
    const { comment } = request.body;

    if (!userId) {
        logger.warn("Unauthorized attempt to comment on post.");
        response.status(status.UNAUTHORIZED);
        throw new Error("Authentication required to comment on a post.");
    }

    if (typeof comment !== "string" || !comment.trim()) {
        logger.error("Invalid or empty comment.");
        response.status(status.VALIDATION_ERROR);
        throw new Error("Comment must be a non-empty string.");
    }

    const post = await Post.findById(postId);
    if (!post) {
        logger.warn(`Comment failed: Post with id ${postId} not found.`);
        response.status(status.NOT_FOUND);
        throw new Error("Post not found.");
    }

    // Assuming post.comments is an array of { userId, comment, date }
    post.comments = post.comments || [];
    post.comments.push({ userId, comment: comment.trim(), date: new Date() });
    await post.save();

    logger.info(`User ${userId} commented on post ${postId}.`);
    response.status(status.OK).json({ message: "Comment added successfully." });
});


/**
 * @description Get the comments assocaited with a post.
 * @route GET api/posts/:id/like
 * @access public
 */
const getCommentsForPost = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Get comments for posts" });
});

module.exports = { 
    commentOnPost,
    getCommentsForPost
};