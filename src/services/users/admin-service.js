const { StatusCodes } = require("http-status-codes");
const { constants } = require("../../config");
const logger = require("../../utils/logger");
const { countUserByCriteria, findUserById, deleteUserById, findUsers } = require("../../database/models/user-model");
const ApiError = require("../../utils/api-error");
const User = require("../../database/schemas/user-schema");


/**
 * Service to fetch all users with optional filters and pagination.
 * 
 * @param {Object} [filters] Optional filters for querying users.
 * @param {Object} [options] Pagination and sorting options.
 * 
 * @returns {Promise<Array>} Array of user documents.
 */
async function getAllUsersService(filters = {}, options = {}) {
    // Extract page and lmit from query parameters
    const page = parseInt(options.page) || 1;
    const rawLimit = parseInt(options.limit) || constants.POST_PER_PAGE_LIMIT;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : constants.POSTS_PER_PAGE_LIMIT;
    
    // Validate the page and limit values
    if (page < 1 || isNaN(page)) {
        logger.warn("Invalid page number provided. Page must be a positive integer.");
        throw new ApiError(
            "Invalid page number provided. Page must be a positive integer.",
            StatusCodes.BAD_REQUEST,
            "INVALID_PAG_NUMBER"
        );
    }
    if (limit < 1 || isNaN(limit)) {
        logger.warn("Invalid limit value provided. Limit must be a positive integer.");
        throw new ApiError(
            "Invalid limit value provided. Limit must be a positive integer.",
            StatusCodes.BAD_REQUEST,
            "INVALID_LIMIT_VALUE"
        );
    }

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Query the User collection to fetch all users and , excluding sensitive fields. 
    // Get the total count of users for pagination metadata
    const [users, totalUsers] = await Promise.all([
        User.find(filters)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-password -refreshToken -__v')
            .exec(),
        User.countDocuments(filters)
    ]);

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

    logger.debug(`Registered users fetched successfully (page: ${page}, limit: ${limit}).`);

    return { users, pagination };
}

/**
 * Service to update a user's details by their ID.
 * 
 * @param {string} userId The ID of the user to update.
 * @param {Object} updateData The data to update.
 * 
 * @returns {Promise<Object|null>} The updated user document or null if not found.
 */
async function updateUserRoleService(userId, updateData) {
    // Extract the role from the request body
    const { role } = updateData;

    // Check if a role was provided in the request body
    if (!role) {
        logger.warn(`Role update failed: No role provided for the user id ${userId}.`);

        throw new ApiError(
            "Role is required for the operation!",
            StatusCodes.VALIDATION_ERROR,
            "ROLE_REQUIRED"
        );
    }

    // Check if the provided role is valid
    if (!constants.VALID_ROLES.includes(role)) {
        logger.warn(`Role update failed: Invalid role "${role}" provided for user id ${userId}.`);

        throw new ApiError(
            `Invalid role detected!`,
            StatusCodes.VALIDATION_ERROR,
            "INVALID_ROLE",
            `The role provided was '${role}' which is not valid. The valid roles are: [${constants.VALID_ROLES.join(', ')}].`
        );
    }

    // Attempt to find the user in the database
    const userDB = await findUserById(userId);

    // Check if user details were found
    if (!userDB) {
        logger.warn(`Role update failed: User with id ${userId} not found.`);

        throw new ApiError(
            `No user with the id: ${userId} was found!`,
            StatusCodes.NOT_FOUND,
            "USER_NOT_FOUND"
        );
    }

    // Store the user's old role before updating
    const oldRole = userDB.role;

    // Update the user's role
    userDB.role = role;

    // Check if the user's role is already the same as the new role
    if (oldRole === userDB.role) {
        logger.info(`User ${userDB.username} (id: ${userDB.id}) already has the role ${role}. No update needed.`);
        
        throw new ApiError(
            `User ${userDB.username} (id: ${userDB.id}) already has the role ${role}.`,
            StatusCodes.CONFLICT,
            "CURRENT_ROLE_MATCHES_NEW_ROLE"
        );
    }

    // Save the updated user document to the database
    await userDB.save();

    return { userDB, oldRole, role };
}

/**
 * Deletes a user by their ID.
 * 
 * @param {string} userId The ID of the user to delete.
 * 
 * @returns {Promise<Object|null>} The deleted user document or null if not found.
 */
async function deleteUserByIdService(userId) {
    // Attempt to retrieve the user from the database using the ID
    const userDB = await findUserById(userId);

    // Check if user exist
    if (!userDB) {
        logger.warn(`Delete failed: User with id ${userId} not found.`);

        // Error will be caught by global error handler
        throw new ApiError(
            `No user with the id: ${userId} found!`, 
            StatusCodes.NOT_FOUND, 
            "USER_NOT_FOUND"
        );
    }

    // If user is found, delete the user from the database
    const deletedUser = await deleteUserById(userDB._id);

    return deletedUser;
}

module.exports = {
    getAllUsersService,
    updateUserRoleService,
    deleteUserByIdService,
};