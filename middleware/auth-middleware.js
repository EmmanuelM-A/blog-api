const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user-schema");
const { status } = require("../utils/status");

const authRouteProtection = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extract token
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token without password
            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            res.status(status.UNAUTHORIZED);
            throw new Error("Not authorized: token failed");
        }
    }

    if (!token) {
        res.status(status.UNAUTHORIZED);
        throw new Error("Not authorized: no token");
    }
});

module.exports = { authRouteProtection };