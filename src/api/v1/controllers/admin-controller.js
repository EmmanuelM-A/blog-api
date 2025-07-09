const expressAsyncHandler = require("express-async-handler");
const logger = require("../../../utils/logger");
const { getAllUsersService, deleteUserByIdService, updateUserRoleService } = require("../../../services/users/admin-service");
const { StatusCodes } = require("http-status-codes");
const { sendSuccessResponse } = require("../../../utils/helpers");

/**
 * Handles an HTTP GET request to retrieve all registered users from the database.
 * 
 * @route GET /api/admin/users
 * @access Private (Admin only)
 *
 * @returns {express.Response} 200 - Returns an array of user objects excluding sensitive fields.
 * @returns {express.Response} 500 - If there is a server/database error, an appropriate error response is automatically handled by expressAsyncHandler.
 * 
 */
const getAllUsers = expressAsyncHandler(async (request, response) => {
    // Extract page and lmit from query parameters
    const page = request.query.page;
    const limit = request.query.limit;

    // Get all users and paginated metadata
    const data = await getAllUsersService({}, { page, limit });

    sendSuccessResponse(
        response, 
        StatusCodes.OK, 
        "Registered users fetched successfully.", 
        data
    );

    logger.info(`Registered users fetched successfully (page: ${page}, limit: ${limit}).`);
});

/**
 * Handles an HTTP DELETE request to remove a user from the database by their unique MongoDB ObjectID.
 *
 * @route DELETE /api/admin/users/:userId
 * @access Private (Admin only)
 *
 * @returns {Response} 200 - JSON message indicating the user was successfully deleted.
 * @returns {Response} 404 - JSON error response if the specified user does not exist.
 */
const deleteUser = expressAsyncHandler(async (request, response) => {
    const deletedUser = await deleteUserByIdService(request.params.userId);

    sendSuccessResponse(response, StatusCodes.OK, `User ${deletedUser.username} deleted successfully.`);

    logger.info(`User ${deletedUser.username} (id: ${deletedUser.id}) deleted successfully.`);
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
const updateUserRole = expressAsyncHandler(async (request, response) => {
    const { userDB, oldRole, role } = await updateUserRoleService(request.params.userId, request.body);

    sendSuccessResponse(
        response, 
        StatusCodes.OK, 
        `The user ${userDB.username}'s role has been updated successfully!`, 
        {
            userId: userDB.id,
            oldRole,
            newRole: role
        }
    );

    logger.info(`User ${userDB.username} (id: ${userDB.id}) role updated from ${oldRole} to ${role}.`);
});


module.exports = { getAllUsers, deleteUser, updateUserRole };