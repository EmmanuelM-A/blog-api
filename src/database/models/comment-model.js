const Comment = require("../schemas/comment-schema");

/**
 * Create a new comment.
 * 
 * @param {Object} commentData The data needed to create a comment. Data = { user: userId, post: postId, content: string, ... }
 * 
 * @returns {Promise<Object>} The created comment document
 */
async function createComment(commentData) {
    return Comment.create(commentData);
}

/**
 * Find a comment by its MongoDB _id.
 * 
 * @param {string} commentId The id assigned to the comment.
 * 
 * @returns {Promise<Object|null>} The comment document or null if not found
 */
async function findCommentById(commentId) {
    return Comment.findById(commentId);
}

/**
 * Find a comment by criteria.
 * 
 * @param {Object} criteria Determines which comments are returned.
 * 
 * @returns {Promise<Object|null>} The comment document or null if not found
 */
async function findCommentByCriteria(criteria) {
    return Comment.findOne(criteria);
}

/**
 * Find multiple comments by criteria (with optional pagination).
 * 
 * @param {Object} criteria Determines which comments are returned.
 * @param {Object} [options] Determines how the comments are returned. Options = { skip, limit, sort }
 * 
 * @returns {Promise<Array>} Array of comment documents
 */
async function findComments(criteria = {}, options = {}) {
    const query = Comment.find(criteria);
    if (options.sort) query.sort(options.sort);
    if (options.skip) query.skip(options.skip);
    if (options.limit) query.limit(options.limit);
    return query.exec();
}

/**
 * Update a comment by its MongoDB _id.
 * 
 * @param {string} commentId The id assigned to the comment.
 * @param {Object} updateData The new data to replace the existing one.
 * 
 * @returns {Promise<Object|null>} The updated comment document or null if not found
 */
async function updateComment(commentId, updateData) {
    return Comment.findByIdAndUpdate(commentId, updateData, { new: true });
}

/**
 * Update a specific detail for a comment.
 * 
 * @param {string} commentId The id assigned to the comment.
 * @param {string} detailKey The field to update.
 * @param {any} detailValue The new value to store in that field.
 * 
 * @returns {Promise<Object|null>} The updated comment document or null if not found
 */
async function updateCommentDetail(commentId, detailKey, detailValue) {
    return Post.findByIdAndUpdate(commentId, { [detailKey]: detailValue }, { new: true });
}

/**
 * Delete a comment by its MongoDB _id.
 * 
 * @param {string} commentId The id assigned ti the comment.
 * 
 * @returns {Promise<Object|null>} The deleted comment document or null if not found
 */
async function deleteCommentById(commentId) {
    return Comment.findByIdAndDelete(commentId);
}

/**
 * Delete comments by criteria.
 * 
 * @param {Object} criteria Determines which comments should be deleted.
 * 
 * @returns {Promise<{ deletedCount: number }>} Result of deletion
 */
async function deleteCommentsByCriteria(criteria) {
    return Comment.deleteMany(criteria);
}

module.exports = {
    createComment,
    findCommentById,
    findCommentByCriteria,
    findComments,
    updateComment,
    updateCommentDetail,
    deleteCommentById,
    deleteCommentsByCriteria,
};