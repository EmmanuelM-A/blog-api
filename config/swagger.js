const YAML = require('yamljs');
const swaggerUI = require("swagger-ui-express");
const logger = require("../utils/logger");

const swaggerDocument = YAML.load("docs/swagger.yaml");

function setupSwagger(app) {
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
    logger.info("Swagger API setup!");
}

module.exports = setupSwagger;