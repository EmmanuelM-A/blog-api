const { sendSuccessResponse } = require("../../../utils/helpers");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const redisClient = require("../../../services/caching/redis-client");
const logger = require("../../../utils/logger");

/**
 * Checks if the server is running and responsive.
 */
const serverHealthCheck = (req, res) => {
    sendSuccessResponse(res, StatusCodes.OK, "Server is healthy.");
};

/**
 * Checks if the database connection is healthy.
 */
const databaseHealthCheck = async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        // 1 = connected, 2 = connecting
        if (dbState === 1) {
            sendSuccessResponse(res, StatusCodes.OK, "Database is healthy.");
        } else {
            res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
                success: false,
                message: "Database is not connected.",
                state: dbState
            });
        }
    } catch (error) {
        logger.error("Database health check error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Database health check failed.",
            error: error.message
        });
    }
};

/**
 * Checks if the Redis connection is healthy.
 */
const redisHealthCheck = async (req, res) => {
    try {
        // redisClient.status: 'ready' means healthy
        if (redisClient.isOpen && redisClient.status === "ready") {
            sendSuccessResponse(res, StatusCodes.OK, "Redis is healthy.");
        } else {
            res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
                success: false,
                message: "Redis is not connected.",
                status: redisClient.status
            });
        }
    } catch (error) {
        logger.error("Redis health check error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Redis health check failed.",
            error: error.message
        });
    }
};

module.exports = { serverHealthCheck, databaseHealthCheck, redisHealthCheck };
