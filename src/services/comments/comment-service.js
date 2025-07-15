const { StatusCodes } = require("http-status-codes");
const logger = require("../../utils/logger");
const { findPostById } = require("../../database/models/post-model");
const { createComment, findComments, findCommentById, deleteCommentById, updateComment, findCommentByCriteria, deleteCommentsByCriteria, countComments } = require("../../database/models/comment-model");
const ApiError = require("../../utils/api-error");
const { constants } = require("../../config");
const Comment = require("../../database/schemas/comment-schema");

/**
 * Adds a comment to a post after validating the input and post existence.
 * 
 * @param {string} postId The ID of the post to comment on.
 * @param {string} userId The ID of the user making the comment.
 * @param {string} commentContent The comment text.
 * 
 * @returns {Promise<Object>} The created comment document.
 * 
 * @throws {ApiError} If validation fails or post does not exist.
 */
async function commentOnPostService(postId, userId, commentContent) {
    // Validate user
    if (!userId) {
        logger.warn("Unauthorized attempt to comment on post.");

        throw new ApiError(
            "Authentication required to comment on a post.",
            StatusCodes.UNAUTHORIZED,
            "UNAUTHORIZED"
        );
    }

    // Validate comment
    if (typeof commentContent !== "string" || !commentContent.trim()) {
        logger.error("Invalid or empty comment.");

        throw new ApiError(
            "Comment must be a non-empty string.",
            StatusCodes.BAD_REQUEST,
            "INVALID_COMMENT"
        );
    }

    // Trim whitespace from the comment
    const trimmedComment = commentContent.trim();

    // If the comment is empty after trimming, it is considered invalid.
    if (trimmedComment.length === 0) {
        logger.error("Comment is empty after trimming.");

        throw new ApiError(
            "Comment cannot be empty!",
            StatusCodes.BAD_REQUEST,
            "EMPTY_COMMENT"
        );
    }

    // Enforce max character limit on comment
    if (trimmedComment.length > constants.MAX_CHAR_COMMENT_LENGTH) {
        logger.error(`Comment exceeds ${constants.MAX_CHAR_COMMENT_LENGTH} characters.`);

        throw new ApiError(
            `Comment exceeds the maximum allowed length of ${constants.MAX_CHAR_COMMENT_LENGTH} characters.`,
            StatusCodes.BAD_REQUEST,
            "COMMENT_TOO_LONG"
        );
    }

    // Retrieve the post from the database
    const postDB = await findPostById(postId);

    // Check post existence
    if (!postDB) {
        logger.warn(`Comment failed: Post with id ${postId} not found.`);

        throw new ApiError(
            `Comment failed: Post with id ${postId} not found.`,
            StatusCodes.NOT_FOUND,
            "POST_NOT_FOUND"
        );
    }

    // Create comment
    const comment = await createComment({
        content: trimmedComment,
        post_id: postId,
        user_id: userId,
    });

    logger.debug(`Comment ${comment.id} created by user ${userId} on post ${postId}`);
    
    return comment;
}

/**
 * Retrieves paginated comments for a specific post.
 * 
 * @param {string} postId The ID of the post.
 * @param {Object} options Pagination and sorting options: { page, limit }
 * 
 * @returns {Promise<Object>} Paginated comments and metadata.
 * 
 * @throws {ApiError} If the post does not exist.
 */
async function getCommentsForPostService(postId, options = {}) {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || constants.POST_PER_PAGE_LIMIT;
    const skip = (page - 1) * limit;

    // Retrieve the post from the database
    const postDB = await findPostById(postId);

    // Check post existence
    if (!postDB) {
        logger.warn(`Post with id ${postId} not found when fetching comments.`);

        throw new ApiError(
            `Post with id ${postId} not found.`,
            StatusCodes.NOT_FOUND,
            "POST_NOT_FOUND"
        );
    }

    // Fetch paginated comments
    const [comments, totalComments] = await Promise.all([
        Comment.find({ post_id: postId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user_id", "username")
            .exec(),
        Comment.countDocuments({ post_id: postId })
    ]);

    logger.debug(`Fetched ${comments.length} comments for post: ${postId}`);

    return {
        comments,
        page,
        totalPages: Math.ceil(totalComments / limit),
        totalComments
    };
}

/**
 * Deletes a comment by its ID.
 * @param {string} commentId - The ID of the comment to delete.
 * @param {string} userId - The ID of the user requesting deletion.
 * @param {string} userRole - The role of the user (for admin check).
 * @returns {Promise<Object|null>} The deleted comment document or null if not found.
 * @throws {ApiError} If the user is not authorized to delete the comment.
 */
async function deleteCommentService(commentId, userId, userRole) {
    const comment = await findCommentById(commentId);
    if (!comment) {
        throw new ApiError(
            "Comment not found.",
            StatusCodes.NOT_FOUND,
            "COMMENT_NOT_FOUND"
        );
    }
    // Only the comment owner or an admin can delete
    if (String(comment.user_id) !== String(userId) && userRole !== "admin") {
        throw new ApiError(
            "You do not have permission to delete this comment.",
            StatusCodes.FORBIDDEN,
            "FORBIDDEN_DELETE"
        );
    }
    return deleteCommentById(commentId);
}

/**
 * Updates a comment's content.
 * @param {string} commentId - The ID of the comment to update.
 * @param {string} userId - The ID of the user requesting the update.
 * @param {string} userRole - The role of the user (for admin check).
 * @param {string} newContent - The new comment content.
 * @returns {Promise<Object|null>} The updated comment document or null if not found.
 * @throws {ApiError} If the user is not authorized or content is invalid.
 */
async function updateCommentService(commentId, userId, userRole, newContent) {
    const comment = await findCommentById(commentId);
    if (!comment) {
        throw new ApiError(
            "Comment not found.",
            StatusCodes.NOT_FOUND,
            "COMMENT_NOT_FOUND"
        );
    }
    // Only the comment owner or an admin can update
    if (String(comment.user_id) !== String(userId) && userRole !== "admin") {
        throw new ApiError(
            "You do not have permission to update this comment.",
            StatusCodes.FORBIDDEN,
            "FORBIDDEN_UPDATE"
        );
    }
    // Validate new content
    if (typeof newContent !== "string" || !newContent.trim()) {
        throw new ApiError(
            "Comment must be a non-empty string.",
            StatusCodes.BAD_REQUEST,
            "INVALID_COMMENT"
        );
    }
    const trimmedContent = newContent.trim();
    if (trimmedContent.length === 0) {
        throw new ApiError(
            "Comment cannot be empty!",
            StatusCodes.BAD_REQUEST,
            "EMPTY_COMMENT"
        );
    }
    if (trimmedContent.length > constants.MAX_CHAR_COMMENT_LENGTH) {
        throw new ApiError(
            `Comment exceeds the maximum allowed length of ${constants.MAX_CHAR_COMMENT_LENGTH} characters.`,
            StatusCodes.BAD_REQUEST,
            "COMMENT_TOO_LONG"
        );
    }
    return updateComment(commentId, { content: trimmedContent });
}

module.exports = {
    commentOnPostService,
    getCommentsForPostService,
    deleteCommentService,
    updateCommentService,
};