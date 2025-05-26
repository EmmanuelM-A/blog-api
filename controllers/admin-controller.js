const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const User = require('../models/user-schema');
const logger = require("../utils/logger");

/**
 * @description Gets all registered users.
 * @route GET api/admin/users
 * @access private
 */
const getAllUsers = asyncHandler( async (request, response) => {
    const users = await User.find().select('-password');

    response.status(status.OK).json(users);

    logger.info("Registered users fetched successfully.");
});

/**
 * @description Delete a user.
 * @route DELETE api/admin/users/:id
 * @access private
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
 * @route PUT api/admin/users/:id/role
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
        throw new Error(`Invalid role. Valid roles are: ${validRoles.join(', ')}`);
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