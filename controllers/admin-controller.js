const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const User = require('../models/user-schema');
const logger = require("../utils/logger");
const { constants } = require("../utils/constants");
const { sendSuccessResponse } = require("../utils/helpers");
const ApiError = require("../utils/ApiError");

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
 * @throws {ApiError} - If the page or limit parameters are invalid, an ApiError is thrown with a specific message and status code.
 */
const getAllUsers = asyncHandler(async (request, response) => {
    // Extract page and lmit from query parameters
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || constants.DEFAULT_PAGE_LIMIT;

    // Validate the page and limit values
    if (page < 1 || isNaN(page)) {
        logger.warn("Invalid page number provided. Page must be a positive integer.");
        throw new ApiError(
            "Invalid page number provided. Page must be a positive integer.",
            status.BAD_REQUEST,
            "INVALID_PAG_NUMBER"
        );
    }
    if (limit < 1 || isNaN(limit)) {
        logger.warn("Invalid limit value provided. Limit must be a positive integer.");
        throw new ApiError(
            "Invalid limit value provided. Limit must be a positive integer.",
            status.BAD_REQUEST,
            "INVALID_LIMIT_VALUE"
        );
    }

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Get the total count of users for pagination metadata
    const totalUsers = await User.countDocuments();

    // Query the User collection to fetch all users, excluding sensitive fields. 
    const users = await User.find()
        .select('-password -refreshToken -__v')
        .skip(skip)
        .limit(limit);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;

    // Construct the pagination object
    const pagination = {
        totalUsers,
        currentPage: page,
        totalPages,
        limit,
        hasNextPage,
    };

    sendSuccessResponse(
        response, 
        status.OK, 
        "Registered users fetched successfully.", 
        {
            users,
            pagination
        }
    );

    logger.info(`Registered users fetched successfully (page: ${page}, limit: ${limit}).`);
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

    // Check if user exist
    if (!userDB) {
        logger.warn(`Delete failed: User with id ${request.params.userId} not found.`);

        // Error will be caught by global error handler
        throw new ApiError(
            `No user with the id: ${request.params.userId} found!`, 
            status.NOT_FOUND, 
            "USER_NOT_FOUND"
        );
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

        throw new ApiError(
            "Role is required for the operation!",
            status.VALIDATION_ERROR,
            "ROLE_REQUIRED"
        );
    }

    // Check if the provided role is valid
    if (!constants.VALID_ROLES.includes(role)) {
        logger.warn(`Role update failed: Invalid role "${role}" provided for user id ${request.params.userId}.`);

        throw new ApiError(
            `Invalid role detected!`,
            status.VALIDATION_ERROR,
            "INVALID_ROLE",
            `The role provided was '${role}' which is not valid. The valid roles are: [${constants.VALID_ROLES.join(', ')}].`
        );
    }

    // Attempt to find the user in the database
    const user = await User.findById(request.params.userId);

    // Check if user details were found
    if (!user) {
        logger.warn(`Role update failed: User with id ${request.params.userId} not found.`);

        throw new ApiError(
            `No user with the id: ${request.params.userId} was found!`,
            status.NOT_FOUND,
            "USER_NOT_FOUND"
        );
    }

    // Store the user's old role before updating
    const oldRole = user.role;

    // Update the user's role
    user.role = role;

    // Check if the user's role is already the same as the new role
    if (oldRole === user.role) {
        logger.info(`User ${user.username} (id: ${user.id}) already has the role ${role}. No update needed.`);
        return sendSuccessResponse(
            response, 
            status.OK, 
            `User ${user.username} already has the role ${role}. No update needed.`
        );
    }

    // Save the updated user document to the database
    await user.save();

    sendSuccessResponse(
        response, 
        status.OK, 
        `The user ${user.username}'s role has been updated successfully!`, 
        { userId: user.id, oldRole, newRole: role }
    );

    logger.info(`User ${user.username} (id: ${user.id}) role updated from ${oldRole} to ${role}.`);
});


module.exports = { getAllUsers, deleteUser, updateUserRole };