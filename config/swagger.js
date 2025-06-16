const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const logger = require("../utils/logger");
const { constants } = require("../utils/constants");

const PORT = process.env.PORT || constants.DEFAULT_PORT;

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Blog API",
            version: "1.0.0",
            description: "API documentation for the Blog Platform",
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "https",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
    logger.info("Swagger API setup!");
}

module.exports = setupSwagger;