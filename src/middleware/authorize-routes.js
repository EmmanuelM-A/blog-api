const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const ApiError = require("../utils/api-error");
const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const { findUserById } = require("../database/models/user-model");
const User = require("../database/schemas/user-schema");

/**
 * Checks if a request has a valid authorization header and verifies its value (the acess token).
 */
const authRouteProtection = expressAsyncHandler(async (request, response, next) => {
    let token;

    if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
        try {
            // Extract token
            token = request.headers.authorization.split(" ")[1];
            logger.info("Authorization header found. Token extracted.");

            // Verify token
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            logger.info(`Token verified for user ID: ${decoded.id}`);

            // Get user from token without password
            request.user = await User.findById(decoded.id).select("-password");

            if (!request.user) {
                logger.error(`User not found for with the id: ${decoded.id}`);

                throw new ApiError(
                    `The use with the id ${decoded.id} does not exist!`,
                    StatusCodes.NOT_FOUND,
                    "USER_NOT_FOUND"
                );
            }

            logger.info(`User authenticated: ${request.user.username} (${request.user.id})`);

            next();
        } catch (error) {
            logger.error(`Token verification failed: ${error.message}`);

            throw new ApiError(
                "Not authorized: token verification failed",
                StatusCodes.UNAUTHORIZED,
                "TOKEN_VERIFICATION_FAILED"
            );
        }
    }

    if (!token) {
        logger.warn("No authorization token provided.");

        throw new ApiError(
            "Not authorized: no token provided",
            StatusCodes.UNAUTHORIZED,
            "NO_TOKEN_PROVIDED"
        );
    }
});

module.exports = { authRouteProtection };