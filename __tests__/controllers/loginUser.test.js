const { loginUser } = require("../../controllers/user-controller");
const User = require('../../models/user-schema');
const { status } = require('../../utils/status');
const logger = require('../../utils/logger');
const { validatePassword, validateEmail } = require("../../utils/input-validator");
const { comparePassword, generateToken } = require("../../utils/helpers");

jest.mock('../../models/user-schema.js'); // Mock User model
jest.mock('../../utils/logger'); // Mock logger
jest.mock("../../utils/input-validator"); // Mock validators

jest.mock("../../utils/helpers", () => ({
    comparePassword: jest.fn((x) => x),
    generateToken: jest.fn((x) => x),
}));

describe('loginUser', () => {
    let request, response;

    beforeEach(() => {
        request = {
            body: {
                email: 'test@example.com',
                password: 'Password123!'
            }
        };
        response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Reset mock states before each test
        validateEmail.mockReset();
        validatePassword.mockReset();
        User.findOne.mockReset();
        User.create.mockReset();
        generateToken.mockReset();
        comparePassword.mockReset();
        logger.info.mockReset();
        logger.error.mockReset();

        // Valid by default
        validateEmail.mockReturnValue(true);
        validatePassword.mockReturnValue(true);
    });

    it('should throw an error if any field is missing', async () => {
        request.body.email = '';

        await expect(loginUser(request, response)).rejects.toThrow("All fields must be filled!");

        expect(logger.error).toHaveBeenCalledWith("Login failed: Missing fields detected.");
    });

    it('should throw an error if the email inputted is invalid', async () => {
        validateEmail.mockReturnValue(false);

        await expect(loginUser(request, response)).rejects.toThrow("Login failed: Invalid email!");

        expect(logger.error).toHaveBeenCalledWith("Login failed: Invalid input!");
    });

    it('should throw an error if the password inputted is invalid', async () => {
        validatePassword.mockReturnValue(false);

        await expect(loginUser(request, response)).rejects.toThrow("Login failed: Invalid password!");

        expect(logger.error).toHaveBeenCalledWith("Login failed: Invalid input!");
    });

    it('should login a user successfully', async () => {
        const userDB = {
            id: "123",
            username: 'testuser',
            email: 'test@example.com',
            role: 'user',
            password: 'hashedPassword'
        };

        // User with matching creditials does exist in database
        User.findOne.mockResolvedValue(userDB);

        // Password comparison successful
        comparePassword.mockResolvedValue(true);

        // Mock generated token
        generateToken.mockReturnValue("accessToken");

        await loginUser(request, response);

        expect(response.status).toHaveBeenCalledWith(status.OK);

        expect(response.json).toHaveBeenCalledWith({
            _id: userDB.id,
            username: userDB.username,
            email: userDB.email,
            role: userDB.role,
            token: "accessToken"
        });

        expect(logger.info).toHaveBeenCalledWith(`Login successful: ${request.body.email}`);
    });

    it('should throw an error if the user login is unsuccessful', async () => {
        // User not found
        User.findOne.mockResolvedValue(null);

        await expect(loginUser(request, response)).rejects.toThrow("Invalid credentials");

        expect(logger.error).toHaveBeenCalledWith(`Login unsuccessful: ${request.body.email}`);
    });
});