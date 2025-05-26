const asyncHandler = require('express-async-handler');
const { status } = require('../utils/status');
const logger = require('../utils/logger');

const authorizeRoles = (...allowedRoles) => {
    return asyncHandler((request, response, next) => {
        const user = request.user;
        if (!user || !allowedRoles.includes(user.role)) {
            logger.warn(
                `Unauthorized access attempt by user: ${user?.email || "unknown"} | Role: ${user?.role || "none"} | Endpoint: ${request.originalUrl}`
            );
            response.status(status.FORBIDDEN);
            throw new Error("You do not have permission to perform this action!");
        }
        next();
    });
};

module.exports = { authorizeRoles };