const asyncHandler = require('express-async-handler');
const { status } = require('../utils/status');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const authorizeRoles = (...allowedRoles) => {
    return asyncHandler((request, response, next) => {
        const user = request.user;
        if (!user || !allowedRoles.includes(user.role)) {
            logger.warn(
                `Unauthorized access attempt by user: ${user?.email || "unknown"} | Role: ${user?.role || "none"} | Endpoint: ${request.originalUrl}`
            );

            throw new ApiError(
                `The user ${user?.username || "unknown"} does not have the permissions to perform this action!`,
                status.FORBIDDEN,
                "PERMISSION_DENIED",
                `User role '${user?.role || "none"}' is not allowed to access this resource. Allowed roles are: [${allowedRoles.join(', ')}].`
            );
        }
        next();
    });
};

module.exports = { authorizeRoles };