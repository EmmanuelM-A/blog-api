const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const User = require('../models/user-schema');
const logger = require("../utils/logger");

/**
 * @function getAllUsers
 * @description Handles an HTTP GET request to retrieve all registered users from the database. This endpoint is restricted to 
 * admin users only and is intended for administrative oversight. It excludes sensitive fields such as passwords, refresh tokens, 
 * and Mongoose versioning data before sending the response to ensure security and privacy.
 *
 * @route GET /api/admin/users
 * @access Private (Admin only)
 *
 * @param {Object} request - The Express request object (not directly used in this function but included for middleware compatibility).
 * @param {Object} response - The Express response object used to send the retrieved user data or an error response.
 *
 * @returns {Response} 200 - Returns an array of user objects excluding sensitive fields.
 * @returns {Response} 500 - If there is a server/database error, an appropriate error response is automatically handled by asyncHandler.
 *
 * @throws {Error} - Any uncaught database or operational error will be passed to the error-handling middleware.
 *
 * @example
 * // Sample request from client (Admin only):
 * GET /api/admin/users
 * 
 * // Sample successful response:
 * [
 *   {
 *     "_id": "609d6c9b3f1d2b001f89f100",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "role": "user"
 *   },
 *   ...
 * ]
 */
const getAllUsers = asyncHandler(async (request, response) => {
    // Query the User collection to fetch all users, excluding sensitive fields like password, refreshToken, and __v (version key).
    const users = await User.find().select('-password -refreshToken -__v');

    // Send a successful HTTP 200 response with the filtered user list.
    response.status(status.OK).json(users);

    // Log a success message for monitoring or audit purposes.
    logger.info("Registered users fetched successfully.");
});


/**
 * @function deleteUser
 * @description
 * Handles an HTTP DELETE request to remove a user from the database based on their unique ID.
 * This function is restricted to administrative use and performs validation before deletion.
 * If the user does not exist, it logs the attempt and returns a 404 response.
 *
 * @route DELETE /api/admin/users/:id
 * @access Private (Admin only)
 *
 * @param {Object} request - Express request object containing the user ID as a route parameter.
 * @param {Object} response - Express response object used to return the operation result.
 *
 * @returns {Response} 200 - Returns a success message if the user is deleted.
 * @returns {Response} 404 - If no user with the specified ID is found.
 *
 * @throws {Error} - Throws an error if the user is not found (handled by asyncHandler).
 *
 * @example
 * // Client request:
 * DELETE /api/admin/users/609d6c9b3f1d2b001f89f100
 *
 * // Sample response:
 * {
 *   "message": "User johndoe deleted successfully."
 * }
 */
const deleteUser = asyncHandler( async (request, response) => {
    const userDB = await User.findById(request.params.id);

    if (!userDB) {
        logger.warn(`Delete failed: User with id ${request.params.id} not found.`);
        response.status(status.NOT_FOUND);
        throw new Error('User not found');
    }

    await userDB.deleteOne();

    response.status(status.OK).json({ message: `User ${userDB.username} deleted successfully.` });

    logger.info(`User ${userDB.username} (id: ${userDB.id}) deleted successfully.`);
});

/**
 * @description Update a user's role.
 * @route PATCH api/admin/users/:id/role
 * @access private
 */
const updateUserRole = asyncHandler( async (request, response) => {
    const { role } = request.body;

    if (!role) {
        logger.warn(`Role update failed: No role provided for user id ${request.params.id}.`);
        response.status(status.VALIDATION_ERROR);
        throw new Error("Role is required");
    }

    const validRoles = ['user', 'author', 'admin'];
    
    if (!validRoles.includes(role)) {
        logger.warn(`Role update failed: Invalid role "${role}" provided for user id ${request.params.id}.`);
        response.status(status.VALIDATION_ERROR);
        throw new Error(`Invalid role. Valid roles are: ${validRoles.join(', ')}.`);
    }

    const user = await User.findById(request.params.id);

    if (!user) {
        logger.warn(`Role update failed: User with id ${request.params.id} not found.`);
        response.status(status.NOT_FOUND);
        throw new Error('User not found');
    }

    const oldRole = user.role;
    user.role = role;

    await user.save();

    response.status(status.OK).json({ message: `User ${user.username}'s role updated to ${role}` });

    logger.info(`User ${user.username} (id: ${user.id}) role updated from ${oldRole} to ${role}.`);
});

module.exports = { getAllUsers, deleteUser, updateUserRole };