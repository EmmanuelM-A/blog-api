const { status } = require("../utils/status");
const express = import('express');

/**
 * @typedef {object} APIErrorResponse
 * @property {boolean} success - Indicates if the request was successful (always false for errors).
 * @property {string} message - A human-readable message describing the error.
 * @property {object} [error] - An object containing structured error details.
 * @property {string} [error.code] - A machine-readable error code (e.g., "VALIDATION_FAILED").
 * @property {string} [error.details] - More specific details about the error. (could be an array for validation)
 * @property {string} [stackTrace] - The stack trace of the error (typically only in development).
 */

/**
 * Global error handling middleware for Express. This middleware catches errors thrown by route handlers or other middleware,
 * sets the appropriate HTTP status code, and formats the error response according to a standardized JSON structure.
 *
 * It provides specific responses for common HTTP error statuses (400, 401, 403, 404, 500) and a generic server error for uncaught 
 * issues. Stack traces are included for debugging purposes, but should be suppressed in production environments.
 *
 * @param {Error} error - The error object caught by the middleware.
 * @param {express.Request} request - The Express request object.
 * @param {express.Response} response - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function (not typically called in error handling).
 * @returns {void}
 */
const errorHandler = (error, request, response, next) => {
    // Determine the status code from the response if already set, otherwise default to 500
    // This allows custom errors to set their own status codes (e.g., via `error.statusCode`)
    const statusCode = response.statusCode === 200 ? 500 : response.statusCode || 500;

    // Set the response status code
    response.status(statusCode);

    // Initialize the response body
    let responseBody = {
        success: false,
        message: error.message || 'An unexpected error occurred.', // Use error message or a generic one
        error: {
            code: status.SERVER_ERROR, // Default error code
            details: error.message || 'Something went wrong on our end.' // Default error details
        }
    };

    if (process.env.NODE_ENV === 'development') {
        responseBody.stackTrace = error.stack;
    }

    switch(statusCode) {
        case status.VALIDATION_ERROR:
            responseBody.message = error.message || "Validation failed.";
            responseBody.error.code = status.VALIDATION_ERROR;
            if (error.details) {
                responseBody.error.details = error.details;
            } else {
                responseBody.error.details = error.message || "One or more input fields are invalid.";
            }
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

    // Send the formatted JSON response
    response.json(responseBody);
}

module.exports = errorHandler;