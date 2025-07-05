/**
 * HTTP status codes for API responses.
 * @typedef {Object} StatusCodes
 * @property {number} OK - 200: Standard response for successful HTTP requests.
 * @property {number} CREATED - 201: The request has succeeded and a new resource has been created.
 * @property {number} ACCEPTED - 202: The request has been accepted for processing, but the processing has not been completed.
 * @property {number} NO_CONTENT - 204: The server successfully processed the request, but is not returning any content.
 * @property {number} BAD_REQUEST - 400: The server could not understand the request due to invalid syntax.
 * @property {number} VALIDATION_ERROR - 400: The server could not understand the request due to validation errors.
 * @property {number} UNAUTHORIZED - 401: The client must authenticate itself to get the requested response.
 * @property {number} FORBIDDEN - 403: The client does not have access rights to the content.
 * @property {number} NOT_FOUND - 404: The server can not find the requested resource.
 * @property {number} CONFLICT - 409: The request could not be completed due to a conflict with the current state of the resource.
 * @property {number} UNPROCESSABLE_ENTITY - 422: The request was well-formed but was unable to be followed due to semantic errors.
 * @property {number} TOO_MANY_REQUESTS - 429: The user has sent too many requests in a given amount of time.
 * @property {number} SERVER_ERROR - 500: The server has encountered a situation it doesn't know how to handle.
 * @property {number} NOT_IMPLEMENTED - 501: The server does not support the functionality required to fulfill the request.
 * @property {number} BAD_GATEWAY - 502: The server, while acting as a gateway or proxy, received an invalid response from the upstream server.
 * @property {number} SERVICE_UNAVAILABLE - 503: The server is not ready to handle the request.
 */

/** @type {StatusCodes} */
exports.status = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503
};