const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const logger = require("../utils/logger");


/**
 * Sets up Swagger documentation on the Express app.
 * Loads and resolves all references in the OpenAPI YAML.
 * 
 * @param {import('express').Express} app - The Express application instance.
 */
const setupSwaggerDocs = async (app) => {
    const swaggerDocument = YAML.load(path.resolve(__dirname, "bundled-swagger.yaml"));

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    const DOCS_URL = process.env.SERVICE_URL?.trim() !== ''
        ? `${process.env.SERVICE_URL}/api-docs` : `http://localhost:${process.env.PORT || 5000}/api-docs`;

    logger.info(`Swagger docs available at ${DOCS_URL}`)
}

module.exports = setupSwaggerDocs;