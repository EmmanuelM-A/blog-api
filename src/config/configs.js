const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "../..");

/**
 * All the configurations and settigns for the application
 */
const settings = {
	server: {
		NODE_ENV: process.env.NODE_ENV ?? "development",
		PORT: Number(process.env.PORT) ?? 5000,
		ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN ?? "http://localhost:3000"
	},

	app: {
		ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
		REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
		SERVICE_URL: process.env.SERVICE_URL,

		// Logic configs
		MAX_TITLE_LENGTH: 100, // In chars
		MAX_CONTENT_LENGTH: 5000, // In chars
		MAX_COMMENT_LENGTH: 500, // In chars
		MAX_TAG_LENGTH: 30, // In chars
		MAX_TAGS_PER_POST: 5,
	},

	logging: {
		LOG_LEVEL: process.env.LOG_LEVEL ?? "debug",
		LOG_DIR: `${PROJECT_ROOT}/logs`,
		LOG_AS_JSON: process.env.LOG_AS_JSON === "true" ?? false,
	},

	rateLimit: {
		WINDOW_MS: 15 * 60 * 1000, // 15 minutes
		GLOBAL_MAX: 100,
		AUTH_MAX: 10,
	},

	database: {
		MONGO_URI: process.env.MONGO_URI,
		REDIS_URL: process.env.REDIS_URL,
	},
};

module.exports = { settings };
