const os = require("node:os");
const mongoose = require("mongoose");
const ApiError = require("../../utils/api-error");
const { StatusCodes } = require("http-status-codes");
const redisClient = require("../caching/redis-client");

/**
 * Returns basic health status including uptime and memory usage.
 *
 * @returns Health check data.
 */
const serverHealthCheckService = () => {
	return {
		status: "OK",
		uptime: process.uptime(),
		memory: {
			rss: process.memoryUsage().rss,
			heapUsed: process.memoryUsage().heapUsed,
			heapTotal: process.memoryUsage().heapTotal,
		},
		cpuCount: os.cpus().length,
		platform: os.platform(),
		loadAverage: os.loadavg(),
	};
};

/**
 * Tests the health of the database connection.
 *
 * @returns The database health status.
 */
const databaseHealthCheckService = () => {
	const dbState = mongoose.connection.readyState;

	if (dbState !== 1) {
		throw new ApiError(
			"Database connection is not healthy.",
			StatusCodes.INTERNAL_SERVER_ERROR,
			"DATABASE_CONNECTION_FAILED",
		);
	}

	return {
		status: "OK",
		dbState: dbState,
	};
};

/**
 * Tests the health of the Redis connection.
 *
 * @returns The Redis health status.
 */

const redisHealthCheckService = async () => {
	if (!redisClient.isOpen) {
		throw new ApiError(
			"Redis is not connected.",
			StatusCodes.INTERNAL_SERVER_ERROR,
			"REDIS_CONNECTION_FAILED",
		);
	}

	try {
		// This will throw if Redis is not healthy
		const pong = await redisClient.ping();
		if (pong !== "PONG") {
			throw new Error("Unexpected Redis PING response");
		}
	} catch (err) {
		throw new ApiError(
			`Redis ping failed: ${err.message}`,
			StatusCodes.SERVICE_UNAVAILABLE,
			"REDIS_NOT_READY",
		);
	}

	return {
		status: "OK",
		redisStatus: "connected",
	};
};

module.exports = {
	serverHealthCheckService,
	databaseHealthCheckService,
	redisHealthCheckService,
};
