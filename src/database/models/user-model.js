const User = require("../schemas/user-schema");

/**
 * Create a new user with the given user data.
 * 
 * @param {Object} userData The required data to create a new user.
 * 
 * @returns {Promise<Object>} The created user document
 */
async function createUser(userData) {
    return User.create({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role || "user"
    });
}

/**
 * Delete a user by their MongoDB _id.
 * @param {string} userId
 * @returns {Promise<Object|null>} The deleted user document or null if not found
 */
async function deleteUserById(userId) {
    return User.findByIdAndDelete(userId);
}

/**
 * Delete a user by their username.
 * @param {string} username
 * @returns {Promise<Object|null>} The deleted user document or null if not found
 */
async function deleteUserByUsername(username) {
    return User.findOneAndDelete({ username });
}

/**
 * Find a user by their MongoDB _id.
 * @param {string} userId
 * @returns {Promise<Object|null>} The user document or null if not found
 */
async function findUserById(userId) {
    return User.findById(userId);
}

/**
 * Find a user by the provided criteria.
 * 
 * @param {Object} criteria The criteria to search for.
 * 
 * @returns {Promise<Object|null>} The user document or null if not found
 */
async function findUserByCriteria(criteria) {
    return User.findOne(criteria);
}

/**
 * Find multiple users by criteria (with optional pagination).
 * 
 * @param {Object} criteria Determines which users are returned.
 * @param {Object} [options] Determines how the users are returned. Options = { skip, limit, sort }
 * 
 * @returns {Promise<Array>} Array of user documents
 */
async function findUsers(criteria = {}, options = {}) {
    const query = User.find(criteria);
    if (options.sort) query.sort(options.sort);
    if (options.skip) query.skip(options.skip);
    if (options.limit) query.limit(options.limit);
    return query;
}

/**
 * Update a user by their MongoDB _id.
 * 
 * @param {string} userId
 * @param {Object} updateData
 * 
 * @returns {Promise<Object|null>} The updated user document or null if not found
 */
async function updateUser(userId, updateData) {
    return User.findByIdAndUpdate(userId, updateData, { new: true });
}

/**
 * Update a specific detail for a user.
 * 
 * @param {string} userId The id assigned to the user.
 * @param {string} detailKey The field to update.
 * @param {any} detailValue The new value to assign to the field to update.
 * 
 * @returns {Promise<Object|null>} The updated user document or null if not found
 */
async function updateUserDetail(userId, detailKey, detailValue) {
    return User.findByIdAndUpdate(userId, { [detailKey]: detailValue }, { new: true });
}

/**
 * Returns the number of users that meet a specific criteria. 
 * 
 * @param {Object} criteria Determines which users are counted. Acts as a filter.
 * 
 * @returns {Number} The number of users that meet the provided criteria.
 */
async function countUserByCriteria(criteria) {
    return User.countDocuments(criteria);
}

module.exports = {
    createUser,
    deleteUserById,
    deleteUserByUsername,
    findUserById,
    findUserByCriteria,
    findUsers,
    updateUser,
    updateUserDetail,
    countUserByCriteria
};