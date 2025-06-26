const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const User = require('../models/user-schema');
const logger = require("../utils/logger");
const { constants } = require("../utils/constants");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/helpers");

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
 * @returns {express.Response} 200 - Returns an array of user objects excluding sensitive fields.
 * @returns {express.Response} 500 - If there is a server/database error, an appropriate error response is automatically handled by asyncHandler.
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
    sendSuccessResponse(response, status.OK, "Registered users fetched successfully.", users);

    // Log a success message for monitoring or audit purposes.
    logger.info("Registered users fetched successfully.");
});

/**
 * @function deleteUser
 * @description
 * Handles an HTTP DELETE request to remove a user from the database by their unique MongoDB ObjectID.
 * This action is restricted to administrators. The function verifies the user's existence before deleting them,
 * logs the operation outcome, and responds accordingly. It also ensures proper error propagation to global error handling.
 *
 * @route DELETE /api/admin/users/:userId
 * @access Private (Admin only)
 *
 * @param {import('express').Request} request - Express request object containing the userId in the route parameter.
 * @param {import('express').Response} response - Express response object used to send back the operation result.
 *
 * @returns {Response} 200 - JSON message indicating the user was successfully deleted.
 * @returns {Response} 404 - JSON error response if the specified user does not exist.
 *
 * @throws {Error} - If the user is not found, an error is thrown and passed to the error-handling middleware.
 */
const deleteUser = asyncHandler(async (request, response) => {
    // Attempt to retrieve the user from the database using the ID from the route parameters
    const userDB = await User.findById(request.params.userId);

    // If user doesn't exist, log a warning and return a 404 error
    if (!userDB) {
        logger.warn(`Delete failed: User with id ${request.params.userId} not found.`);

        // Error will be caught by global error handler
        throw new Error(`No user with the id: ${request.params.userId} found!`);
    }

    // If user is found, delete the user from the database
    await userDB.deleteOne();

    // Respond to client with a success message
    sendSuccessResponse(response, status.OK, `User ${userDB.username} deleted successfully.`);

    // Log the deletion event for audit or debugging purposes
    logger.info(`User ${userDB.username} (id: ${userDB.id}) deleted successfully.`);
});

/**
 * @function updateUserRole
 * @description
 * Handles an HTTP PATCH request to update a user's role in the system. The new role is validated against a predefined list
 * of acceptable roles. Only administrators can access this route. If the role is invalid or missing, or the user is not found,
 * appropriate error responses are returned. Otherwise, the role is updated, saved, and a confirmation is returned.
 *
 * @route PATCH /api/admin/users/:userId/role
 * @access Private (Admin only)
 *
 * @param {import('express').Request} request - Express request object containing the user ID as a route parameter and the new role in the request body.
 * @param {import('express').Response} response - Express response object used to return the result of the operation.
 *
 * @returns {Response} 200 - A success message indicating the user's role was updated.
 * @returns {Response} 400 - If no role is provided or the role is invalid.
 * @returns {Response} 404 - If the specified user does not exist.
 *
 * @throws {Error} - Throws an error on validation failure or user not found. These are handled by the global error handler.
 */
const updateUserRole = asyncHandler(async (request, response) => {
    // Extract the role from the request body
    const { role } = request.body;

    // Check if a role was provided in the request body
    if (!role) {
        logger.warn(`Role update failed: No role provided for the user id ${request.params.userId}.`);
        throw new Error("Role is required for the operation!");
    }

    // If the provided role is not valid, log and throw an error
    if (!constants.VALID_ROLES.includes(role)) {
        logger.warn(`Role update failed: Invalid role "${role}" provided for user id ${request.params.userId}.`);
        throw new Error(`Invalid role detected! The valid roles are: ${constants.VALID_ROLES.join(', ')}.`);
    }

    // Attempt to find the user in the database
    const user = await User.findById(request.params.userId);

    // If user is not found, log and throw a 404 error
    if (!user) {
        logger.warn(`Role update failed: User with id ${request.params.userId} not found.`);
        throw new Error(`No user with the id: ${request.params.userId} found!`);
    }

    // Store the user's old role before updating
    const oldRole = user.role;

    // Update the user's role
    user.role = role;

    // Save the updated user document to the database
    await user.save();

    // Send a success response to the client
    sendSuccessResponse(response, status.OK, `User ${user.username}'s role updated successfully.`, { userId: user.id, oldRole, newRole: role });

    // Log the successful role change
    logger.info(`User ${user.username} (id: ${user.id}) role updated from ${oldRole} to ${role}.`);
});


module.exports = { getAllUsers, deleteUser, updateUserRole };