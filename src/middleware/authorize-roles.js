const logger = require('../utils/logger');
const ApiError = require('../utils/api-error');
const expressAsyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

/**
 * Restricts access to certain routes based on the allowed roles a user must have.
 * 
 * @param  {...any} allowedRoles The list of roles a user must be assigned to.
 * 
 * @returns A function that checks if a user is authorized to access a route.
 */
const authorizeRoles = (...allowedRoles) => {
    return expressAsyncHandler((request, response, next) => {
        const user = request.user;
        if (!user || !allowedRoles.includes(user.role)) {
            logger.warn(
                `Unauthorized access attempt by user: ${user?.email || "unknown"} | Role: ${user?.role || "none"} | Endpoint: ${request.originalUrl}`
            );

            throw new ApiError(
                `The user ${user?.username || "unknown"} does not have the permissions to perform this action!`,
                StatusCodes.FORBIDDEN,
                "PERMISSION_DENIED",
                `User role '${user?.role || "none"}' is not allowed to access this resource. Allowed roles are: [${allowedRoles.join(', ')}].`
            );
        }
        next();
    });
};

module.exports = { authorizeRoles };