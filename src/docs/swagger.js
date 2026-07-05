const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const logger = require("../utils/logger");
const path = require("node:path");

/**
 * Sets up Swagger documentation on the Express app.
 * Loads and resolves all references in the OpenAPI YAML.
 *
 * @param {import('express').Express} app - The Express application instance.
 */
const setupSwaggerDocs = async (app) => {
	const swaggerDocument = YAML.load(path.resolve(__dirname, "bundled-swagger.yaml"));

	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

	logger.info("Swagger docs available at /api-docs");
};

module.exports = setupSwaggerDocs;
