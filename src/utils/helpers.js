const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");

async function hashPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
}

async function comparePassword(inputtedPassword, dbPassword) {
    return bcrypt.compare(inputtedPassword, dbPassword);
}

const generateAccessToken = (userID) => {
    return jwt.sign({ id: userID }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5m"
    });
};

const generateRefreshToken = (userID) => {
    return jwt.sign({ id: userID }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    });
}

/**
 * Sends a standardized success response.
 * @function sendSuccessResponse
 * @param {express.Response} response The Express response object.
 * @param {number} statusCode The HTTP status code for the response.
 * @param {string} message The success message to include in the response.
 * @param {object} data The data to include in the response (optional).
 * @returns {void}
 * 
 * @example
 * sendSuccessResponse(response, 200, "User created successfully.", { userId: "12345", ... });
 * 
 * // Sample response object returned:
 *	{
 *		"success": true,
 *		"message": "User created successfully.",
 *		"data": { userId: "12345", ... }
 *	}

 */
const sendSuccessResponse = (response, statusCode, message, data = null) => {
	response.status(statusCode).json({
		success: true,
		message,
		...(data && { data }),
	});
};

/**
 * Sends a standardized error response. 
 * @function sendErrorResponse
 * @param {express.Response} response The Express response object.
 * @param {number} statusCode The HTTP status code for the response.
 * @param {string} message The error message to include in the response.
 * @param {string} code The error code to include in the response (optional).
 * @param {string} details The error details to include in the response (optional).
 * @param {string} stackTrace The stack trace to include in the response (optional, useful for debugging in development).
 * @returns {void}
 * 
 * 
 */
const sendErrorResponse = (response, statusCode, message, code = null, details = null, stackTrace = null) => {
	// Build the response body with the consistent structure
    const responseBody = {
        success: false,
        message: message,
        error: {}
    };

    // Add code and details if they are provided
    if (code) responseBody.error.code = code;
    if (details) responseBody.error.details = details;
	
	if( process.env.NODE_ENV === 'development') {
		// In development, include the stack trace for debugging
		responseBody.stackTrace = stackTrace;
	}

    // Send the response with the specified status code and JSON body
    response.status(statusCode).json(responseBody);
};


module.exports = { 
    hashPassword, 
    comparePassword, 
    generateAccessToken, 
    generateRefreshToken,
    sendSuccessResponse,
    sendErrorResponse 
};