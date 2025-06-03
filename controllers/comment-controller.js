const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const Post = require("../models/post-schema");
const User = require("../models/user-schema"); 
const Comment = require("../models/comment-schema");
const logger = require("../utils/logger");
const { constants } = require("../utils/constants");

/**
 * @description Comment on a post.
 * @route POST api/posts/comment/:postId
 * @access Private
 */
const commentOnPost = asyncHandler( async (request, response) => {
    const { postId } = request.params;
    const userId = request.user?.id;
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

    logger.info(`Comment creation attempt by the user: ${request.user.username} (${userId})`);

    // Create comment object
    const commentForPost = await Comment.create({
        content: comment,
        post_id: postId,
        user_id: userId
    });

    logger.info(`The comment with the comment_id: ${commentForPost.id} created successfully by the user: ${request.user.username} (${userId})`);

    response.status(status.OK).json({ message: "Comment added successfully." });
});


/**
 * @description Get the comments assocaited with a post.
 * @route GET api/posts/comments/:postId
 * @access public
 */
const getCommentsForPost = asyncHandler( async (request, response) => {
    const { postId } = request.params;

    logger.info(`Fetching comments for post: ${postId}`);

    const post = await Post.findById(postId);
    if (!post) {
        logger.warn(`Post with id ${postId} not found when fetching comments.`);
        response.status(status.NOT_FOUND);
        throw new Error("Post not found.");
    }

    // Fetch comments
    const comments = await Comment.find({ post_id: postId })
        .sort({ createdAt: -1 })
        .populate("user_id", "username");

    logger.info(`Fetched ${comments.length} comments for post: ${postId}`);

    response.status(status.OK).json({
        postId,
        comments
    });
});

module.exports = { 
    commentOnPost,
    getCommentsForPost
};