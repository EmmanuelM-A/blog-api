const { sendSuccessResponse } = require("../../../utils/helpers");
const { StatusCodes } = require("http-status-codes");
const {
	serverHealthCheckService,
	databaseHealthCheckService,
	redisHealthCheckService,
} = require("../../../services/health/health-check-services");
const expressAsyncHandler = require("express-async-handler");

/**
 * Checks if the server is running and responsive.
 */
const serverHealthCheck = expressAsyncHandler(async (_request, response) => {
	const healthData = serverHealthCheckService();
	sendSuccessResponse(response, StatusCodes.OK, "Server is healthy.", healthData);
});

/**
 * Checks if the database connection is healthy.
 */
const databaseHealthCheck = expressAsyncHandler(async (_request, response) => {
	const healthData = databaseHealthCheckService();

	sendSuccessResponse(response, StatusCodes.OK, "Database connection is healthy.", healthData);
});

/**
 * Checks if the Redis connection is healthy.
 */
const redisHealthCheck = expressAsyncHandler(async (_request, response) => {
	const healthData = await redisHealthCheckService();

	sendSuccessResponse(response, StatusCodes.OK, "Redis connection is healthy.", healthData);
});

module.exports = { serverHealthCheck, databaseHealthCheck, redisHealthCheck };
