const Like = require("../schemas/like-schema");

/**
 * Create a new like.
 * 
 * @param {Object} likeData The data requried to create a like (postId and userId).
 * 
 * @returns {Promise<Object>} The created like document.
 */
async function createLike(likeData) {
    return Like.create(likeData);
}

/**
 * Find a like by its MongoDB _id.
 * 
 * @param {string} likeId The id assigned to the like.
 * 
 * @returns {Promise<Object|null>} The like document or null if not found
 */
async function findLikeById(likeId) {
    return Like.findById(likeId);
}

/**
 * Find a like by criteria.
 * 
 * @param {Object} criteria 
 * @returns {Promise<Object|null>} The like document or null if not found
 */
async function findLikeByCriteria(criteria) {
    return Like.findOne(criteria);
}

/**
 * Find multiple likes by criteria (with optional pagination).
 * @param {Object} criteria - Mongoose query object
 * @param {Object} [options] - { skip, limit, sort }
 * @returns {Promise<Array>} Array of like documents
 */
async function findLikes(criteria = {}, options = {}) {
    const query = Like.find(criteria);
    if (options.sort) query.sort(options.sort);
    if (options.skip) query.skip(options.skip);
    if (options.limit) query.limit(options.limit);
    return query.exec();
}

/**
 * Delete a like by its MongoDB _id.
 * @param {string} likeId
 * @returns {Promise<Object|null>} The deleted like document or null if not found
 */
async function deleteLikeById(likeId) {
    return Like.findByIdAndDelete(likeId);
}

/**
 * Delete likes by criteria.
 * @param {Object} criteria - Mongoose query object
 * @returns {Promise<{ deletedCount: number }>} Result of deletion
 */
async function deleteLikesByCriteria(criteria) {
    return Like.deleteMany(criteria);
}

module.exports = {
    createLike,
    findLikeById,
    findLikeByCriteria,
    findLikes,
    deleteLikeById,
    deleteLikesByCriteria,
};