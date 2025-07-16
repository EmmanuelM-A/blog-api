const ApiError = require("../src/utils/api-error");

/**
 * Verifies that a function executes successfully and returns the expected result.
 * Also checks that specified mocked dependencies were called with the expected arguments.
 *
 * @param {Function} fn - The function to invoke (should be async).
 * @param {*} expectedResult - The expected return value.
 * @param {Array<{ mockFn: Function, expectedArgs: any[] }>} mockedDependencies - List of mock functions and their expected arguments.
 */
const expectSuccessfulResult = async (fn, expectedResult, mockedDependencies = []) => {
    const result = await fn();

    expect(result).toEqual(expectedResult);

    for (const { mockFn, expectedArgs } of mockedDependencies) {
        expect(mockFn).toHaveBeenCalledWith(expectedArgs);
    }
};

/**
 * Checks if a function called returns the correct error and its
 * assocaited error information.
 * 
 * @param {Function} fn The function to check for. 
 * @param {Number} expectedStatus The status code expected.
 * @param {String} expectedErrMsg The error message expected.
 */
const expectApiError = async (fn, expectedStatus, expectedErrMsg = null) => {
    try {
        await fn();
    } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.status).toBe(expectedStatus);
        if(expectedErrMsg) expect(err.message).toBe(expectedErrMsg);
    }
};

module.exports = { expectApiError, expectSuccessfulResult };