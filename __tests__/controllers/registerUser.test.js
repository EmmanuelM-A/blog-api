const { registerUser } = require('../../controllers/user-controller');
const User = require('../../models/user-schema');
const { status } = require('../../utils/status');
const { logMessage } = require('../../utils/log-utils');
const { validateUsername, validatePassword, validateEmail } = require("../../utils/input-validator");
const { hashPassword } = require("../../utils/helpers");

jest.mock('../../models/user-schema.js'); // For UserDB schema
jest.mock('../../utils/log-utils'); // For the log method
jest.mock("../../utils/input-validator"); // For the input validator
jest.mock("../../utils/helpers", () => ({
    hashPassword: jest.fn((x) => x)
})); // For hashPassword()

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

        validateUsername.mockReturnValue(true);
        validateEmail.mockReturnValue(true);
        validatePassword.mockReturnValue(true);

        User.findOne.mockReset();
        User.create.mockReset();
        logMessage.mockReset();
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

        expect(logMessage).toHaveBeenCalledWith(expect.objectContaining({
            msg: expect.stringContaining("Registration attempt"),
            level: "debug"
        }));

        expect(res.status).toHaveBeenCalledWith(status.CREATED);

        expect(res.json).toHaveBeenCalledWith({
            _id: '123',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
        });
    });

    it('should throw an error if any field is missing', async () => {
        req.body.username = '';

        await expect(registerUser(req, res)).rejects.toThrow(Error);
    });

    it("should throw an error if any input is invalid", async () => {
        validateUsername.mockResolvedValue(false);

        await expect(registerUser(req, res)).rejects.toThrow(Error);
    });

    it('should handle duplicate user', async () => {
        User.findOne.mockResolvedValue({ 
            username: 'testuser', 
            email: 'test@example.com',
            password: "password1234" 
        });

        await expect(registerUser(req, res)).rejects.toThrow('Unable to register with the provided credentials');
    });

    it("should throw if user creation fails", async () => {
        User.findOne.mockResolvedValue(null);
        hashPassword.mockResolvedValue("hashedPassword");
        User.create.mockResolvedValue(null);

        await expect(registerUser(req, res)).rejects.toThrow("User data is not valid!");
    });
});