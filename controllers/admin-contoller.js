const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");

/**
 * @description Gets all registered users.
 * @route GET api/admin/users
 * @access private
 */
const getAllUsers = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Get All users" });
});

/**
 * @description Delete a user.
 * @route DELETE api/admin/users/:id
 * @access private
 */
const deleteUser = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Get Post" });
});

/**
 * @description Update a user's role.
 * @route PUT api/admin/users/:id/role
 * @access private
 */
const updateUserRole = asyncHandler( async (request, response) => {
    response.status(status.OK).json({ message: "Create Post" });
});

module.exports = { getAllUsers, deleteUser, updateUserRole };