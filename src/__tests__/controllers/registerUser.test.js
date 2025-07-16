const { registerUser } = require('../../controllers/user-controller');
const User = require('../../models/user-schema');
const { status } = require('../../utils/status');
const logger = require('../../utils/logger');
const { validateUsername, validatePassword, validateEmail } = require("../../utils/input-validator");
const { hashPassword } = require("../../utils/helpers");

jest.mock('../../models/user-schema.js'); // Mock User model
jest.mock('../../utils/logger'); // Mock logger
jest.mock("../../utils/input-validator"); // Mock validators
jest.mock("../../utils/helpers", () => ({
    hashPassword: jest.fn((x) => x)
})); // Mock the hashPassword

describe('registerUser', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password123!'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Reset mock states before each test
        validateUsername.mockReset();
        validateEmail.mockReset();
        validatePassword.mockReset();
        User.findOne.mockReset();
        User.create.mockReset();
        hashPassword.mockReset();
        logger.info.mockReset();
        logger.error.mockReset();

        // Valid by default
        validateUsername.mockReturnValue(true);
        validateEmail.mockReturnValue(true);
        validatePassword.mockReturnValue(true);
    });

    it('should register a user successfully', async () => {
        // Assume there is no existing user
        User.findOne.mockResolvedValue(null);

        // Mock hashed password
        hashPassword.mockResolvedValue("hashedPassword");

        // Create mock user data
        User.create.mockResolvedValue({
            id: '123',
            username: 'testuser',
            email: 'test@example.com',
            password: "hashedPassword",
            role: 'user'
        });

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(status.CREATED);

        expect(res.json).toHaveBeenCalledWith({
            _id: '123',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
        });

        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Registration attempt"));
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("User created"));
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Registration successful"));
    });

    it('should throw an error if any field is missing', async () => {
        req.body.username = '';

        await expect(registerUser(req, res)).rejects.toThrow("All fields must be filled!");

        expect(logger.error).toHaveBeenCalledWith("Registration failed: Missing fields detected.");
    });

    it("should throw an error if username is invalid", async () => {
        validateUsername.mockReturnValue(false);

        await expect(registerUser(req, res)).rejects.toThrow("Registration failed: Invalid username!");

        expect(logger.error).toHaveBeenCalledWith("Registration failed: Invalid input!");
    });

    it("should throw an error if email is invalid", async () => {
        validateEmail.mockReturnValue(false);

        await expect(registerUser(req, res)).rejects.toThrow("Registration failed: Invalid email!");

        expect(logger.error).toHaveBeenCalledWith("Registration failed: Invalid input!");
    });

    it("should throw an error if password is invalid", async () => {
        validatePassword.mockReturnValue(false);

        await expect(registerUser(req, res)).rejects.toThrow("Registration failed: Invalid password!");

        expect(logger.error).toHaveBeenCalledWith("Registration failed: Invalid input!");
    });

    it('should throw error if user already exists', async () => {
        User.findOne.mockResolvedValue({ username: 'testuser', email: 'test@example.com' });

        await expect(registerUser(req, res)).rejects.toThrow("Unable to register with the provided credentials");

        expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("already exists"));
    });

    it('should throw error if user creation fails', async () => {
        User.findOne.mockResolvedValue(null);
        hashPassword.mockResolvedValue("hashedPassword");
        User.create.mockResolvedValue(null);

        await expect(registerUser(req, res)).rejects.toThrow("An error occured during user registration!");

        expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("User registration failed"));
    });
});