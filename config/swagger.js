const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const logger = require("../utils/logger");

async function setupSwagger(app) {
    const swaggerDocument = YAML.load("docs/swagger.yaml");

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    logger.info("Swagger API setup!");
}

module.exports = setupSwagger;