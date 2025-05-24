const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user-schema");
const { status } = require("../utils/status");

const authRouteProtection = asyncHandler(async (request, response, next) => {
    let token;

    if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
        try {
            // Extract token
            token = request.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            // Get user from token without password
            request.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            response.status(status.UNAUTHORIZED);
            throw new Error("Not authorized: token failed");
        }
    }

    if (!token) {
        response.status(status.UNAUTHORIZED);
        throw new Error("Not authorized: no token");
    }
});

module.exports = { authRouteProtection };