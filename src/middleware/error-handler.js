const { sendErrorResponse } = require("../utils/helpers");
const logger = require("../utils/logger");
const { StatusCodes } = require('http-status-codes');
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

/** @type {CommonErrorsMap} */
const COMMON_ERRORS_MAP = {
    [StatusCodes.BAD_REQUEST]: {
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        details: "One or more input fields are invalid."
    },
    [StatusCodes.NOT_FOUND]: {
        message: "Resource not found.",
        code: "NOT_FOUND",
        details: "The requested resource could not be found."
    },
    [StatusCodes.UNAUTHORIZED]: {
        message: "Authentication required or invalid credentials.",
        code: "UNAUTHORIZED",
        details: "You are not authorized to access this resource."
    },
    [StatusCodes.FORBIDDEN]: {
        message: "Access denied.",
        code: "FORBIDDEN",
        details: "You do not have permission to perform this action."
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: { // Generic 500 for explicit SERVER_ERROR or uncaught errors
        message: "An internal server error occurred.",
        code: "INTERNAL_SERVER_ERROR",
        details: "Something went wrong on our server."
    },
};

/**
 * @function errorHandler
 * @description
 * Global Express error-handling middleware. This function intercepts thrown or passed errors from any middleware or route handler.
 * It maps the error to a standardized JSON response structure and sets the appropriate HTTP status code.
 * 
 * It ensures consistent error response formatting across the entire application and includes detailed debugging information
 * in development environments while keeping the output clean and safe in production.
 *
 * @param {Error} error - The error object caught by Express (can include custom properties like `.details`).
 * @param {express.Request} request - The Express request object.
 * @param {express.Response} response - The Express response object used to send the formatted error.
 * @param {express.NextFunction} next - The next middleware function (typically unused here but required by Express).
 * @returns {void}
 */
const errorHandler = (error, request, response, next) => {
    if (response.headersSent) {
        return next(error); // Delegate to Express's built-in error handler
    }
    
    // Ensure response status is an error, defaulting to 500
    const statusCode = error.status >= 400 && error.status < 500 ? error.status: 500;

    // Get specific error details from the map, or use default server error
    const errorDetails = COMMON_ERRORS_MAP[statusCode] || COMMON_ERRORS_MAP[StatusCodes.INTERNAL_SERVER_ERROR];

    // Build the response body
    let responseBody = {
        message: error.message || errorDetails.message, // Prioritize error.message if available
        error: {
            code: error.code || errorDetails.code,
            details: error.details || errorDetails.details,
        },
    };

    // Add stack trace only in development
    if (process.env.NODE_ENV === 'development') {
        responseBody.stackTrace = error.stack;
    } else {
        // In production, log the full error for server-side debugging, but don't send to client.
        logger.error("Production Error:", {
            message: error.message,
            stack: error.stack,
            url: request.originalUrl,
            method: request.method,
            // Add any other relevant request info here
        });
    }

    sendErrorResponse(response, statusCode, responseBody.message, responseBody.error.code, responseBody.error.details, responseBody.stackTrace);
};

module.exports = errorHandler;