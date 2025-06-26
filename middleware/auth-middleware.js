const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user-schema");
const { status } = require("../utils/status");
const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");

const authRouteProtection = asyncHandler(async (request, response, next) => {
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
                logger.warn(`User not found for ID: ${decoded.id}`);
            } else {
                logger.info(`User authenticated: ${request.user.username} (${request.user.id})`);
            }

            next();
        } catch (error) {
            logger.error(`Token verification failed: ${error.message}`);

            throw new ApiError(
                "Not authorized: token verification failed",
                status.UNAUTHORIZED,
                "TOKEN_VERIFICATION_FAILED"
            );
        }
    }

    if (!token) {
        logger.warn("No authorization token provided.");

        throw new ApiError(
            "Not authorized: no token provided",
            status.UNAUTHORIZED,
            "NO_TOKEN_PROVIDED"
        );
    }
});

module.exports = { authRouteProtection };