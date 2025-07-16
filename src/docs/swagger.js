const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const logger = require("../utils/logger");
const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

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
/*const setupSwaggerDocs = async (app) => {
    // Load the OpenAPI definition from the YAML file.
    const swaggerDocument = YAML.load('src/docs/v1/openapi.yaml');

    // Serve Swagger UI at /api-docs with the loaded document.
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Log successful setup
    logger.info("Swagger API setup!");
}

module.exports = setupSwaggerDocs;*/

/**
 * @function setupSwagger
 * @description
 * Integrates Swagger UI into an Express application with proper $ref resolution.
 * Uses swagger-jsdoc for better handling of external references.
 *
 * @async
 * @param {import('express').Express} app - The Express application instance
 * @returns {Promise<void>} Resolves once Swagger UI has been successfully set up.
 */
const setupSwaggerDocs = async (app) => {
    const options = {
        definition: {
            openapi: '3.0.3',
            info: {
                title: 'Blog API',
                version: '1.0.0',
                description: 'API documentation for the blog platform',
            },
            servers: [
                {
                    url: 'http://localhost:5000/api/v1',
                },
            ],
        },
        apis: [
            path.join(__dirname, '../docs/v1/openapi.yaml'),
            path.join(__dirname, '../docs/v1/routes/**/*.yaml'),
            path.join(__dirname, '../docs/v1/components/**/*.yaml'),
        ],
    };

    try {
        const swaggerDocument = swaggerJSDoc(options);
        
        // Serve Swagger UI at /api-docs
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        
        logger.info("Swagger API setup completed successfully!");
    } catch (error) {
        logger.error("Error setting up Swagger:", error);
    }
};

module.exports = setupSwaggerDocs;