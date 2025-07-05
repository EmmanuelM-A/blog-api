const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const logger = require("../utils/logger");

/**
 * @function setupSwagger
 * @description
 * Integrates Swagger UI into an Express application to serve interactive API documentation.
 * This function loads the OpenAPI definition from a YAML file and registers the Swagger UI middleware
 * at the `/api-docs` endpoint, making it accessible via browser for developers and users.
 *
 * The Swagger YAML file should conform to OpenAPI 3.0+ standards and be located in the `docs/` directory.
 *
 * This setup is typically used during application bootstrapping and is only necessary once.
 *
 * @async
 * @param {import('express').Express} app - The Express application instance to attach the Swagger UI middleware to.
 * @returns {Promise<void>} Resolves once Swagger UI has been successfully set up.
 *
 * @requires swagger-ui-express
 * @requires yamljs
 * @requires logger
 *
 * @sideeffect Adds a middleware route `/api-docs` to the provided Express app.
 */
async function setupSwagger(app) {
    // Load the OpenAPI definition from the YAML file.
    const swaggerDocument = YAML.load("docs/swagger.yaml");

    // Serve Swagger UI at /api-docs with the loaded document.
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Log successful setup
    logger.info("Swagger API setup!");
}

module.exports = setupSwagger;