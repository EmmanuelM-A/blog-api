const Post = require("../schemas/post-schema");

/**
 * Create a new post.
 * 
 * @param {Object} postData The data needed to create a post.
 * 
 * @returns {Promise<Object>} The created post document.
 */
async function createPost(postData) {
    return Post.create(postData);
}

/**
 * Find a post by its MongoDB _id.
 * 
 * @param {string} postId The id assigned to the post.
 * 
 * @returns {Promise<Object|null>} The post document or null if not found.
 */
async function findPostById(postId) {
    return Post.findById(postId);
}

/**
 * Find a single post by criteria.
 * 
 * @param {Object} criteria The criteria used to search for a particular post.
 * 
 * @returns {Promise<Object|null>} The post document or null if not found
 */
async function findPostByCriteria(criteria) {
    return Post.findOne(criteria);
}

/**
 * Find multiple posts by criteria (with optional pagination).
 * 
 * @param {Object} criteria The criteria used to search for posts.
 * @param {Object} [options] Determines how the data should be returned. Options = { skip, limit, sort }
 * 
 * @returns {Promise<Array>} Array of post documents
 */
async function findPosts(criteria = {}, options = {}) {
    const query = Post.find(criteria);
    if (options.sort) query.sort(options.sort);
    if (options.skip) query.skip(options.skip);
    if (options.limit) query.limit(options.limit);
    return query;
}

/**
 * Update a post by its MongoDB _id.
 * 
 * @param {string} postId The id assigned to the post.
 * @param {Object} updateData The data needed to update a post.
 * 
 * @returns {Promise<Object|null>} The updated post document or null if not found.
 */
async function updatePost(postId, updateData) {
    return Post.findByIdAndUpdate(postId, updateData, { new: true });
}

/**
 * Update a specific detail for a post.
 * 
 * @param {string} postId The id assigned to the post.
 * @param {string} detailKey The field to update.
 * @param {any} detailValue The new value to store in that field.
 * 
 * @returns {Promise<Object|null>} The updated post document or null if not found
 */
async function updatePostDetail(postId, detailKey, detailValue) {
    return Post.findByIdAndUpdate(postId, { [detailKey]: detailValue }, { new: true });
}

/**
 * Returns the number of posts that meet a specific criteria. 
 * 
 * @param {Object} criteria Determines which posts are counted. Acts as a filter.
 * 
 * @returns {Number} The number of posts that meet the provided criteria.
 */
async function countPostsByCriteria(criteria) {
    return Post.countDocuments(criteria);
}

/**
 * Delete a post by its MongoDB _id.
 * 
 * @param {string} postId The id assigned to the post.
 * 
 * @returns {Promise<Object|null>} The deleted post document or null if not found
 */
async function deletePostById(postId) {
    return Post.findByIdAndDelete(postId);
}

/**
 * Delete posts by criteria.
 * 
 * @param {Object} criteria The criteria used to determine which posts to delete.
 * 
 * @returns {Promise<{ deletedCount: number }>} Result of deletion
 */
async function deletePostsByCriteria(criteria) {
    return Post.deleteMany(criteria);
}

module.exports = {
    createPost,
    findPostById,
    findPostByCriteria,
    findPosts,
    updatePost,
    updatePostDetail,
    deletePostById,
    deletePostsByCriteria,
    countPostsByCriteria
};