const { status } = require("../utils/status");

/**
 * Handles any errors that occur when accepting requests. Including any response formating.
 */
const errorHandler = (error, request, response, next) => {
    const statusCode = response.statusCode ? response.statusCode : 500;

    switch(statusCode) {
        case status.VALIDATION_ERROR:
            response.json({ 
                title: "Validation Failed", 
                message: error.message, 
                stackTrace: error.stack 
            });
            break;
        case status.NOT_FOUND:
            response.json({ 
                title: "Not Found", 
                message: error.message, 
                stackTrace: error.stack 
            });
            break;
        case status.UNAUTHORIZED:
            response.json({ 
                title: "Unauthorized", 
                message: error.message, 
                stackTrace: error.stack 
            });
            break;
        case status.FORBIDDEN:
            response.json({ 
                title: "Forbidden", 
                message: error.message, 
                stackTrace: error.stack 
            });
            break;
        case status.SERVER_ERROR:
            response.json({ 
                title: "Server Error", 
                message: error.message, 
                stackTrace: error.stack 
            });
            break;

        default:
            console.log("No errors detected! Your all Good!");
            break;

    }
}

module.exports = errorHandler;