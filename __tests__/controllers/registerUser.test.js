const { registerUser } = require('../../controllers/user-controller');
const User = require('../../models/user-schema');
const { status } = require('../../utils/status');
const { logMessage } = require('../../utils/log-utils');
const { validateUsername, validatePassword, validateEmail } = require("../../utils/input-validator");
const { logMessage } = require("../../utils/log-utils");
const { hashedPassword } = require("../../utils/helpers");

jest.mock('../models/user-schema.js'); // For UserDB schema
jest.mock('../utils/log-utils'); // For the log method
jest.mock("../utils/input-validator"); // For the input validator
jest.mock("bcrypt"); // For hashPassword()

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

        User.findOne.mockReset();
        User.create.mockReset();
        logMessage.mockReset();

        validateUsername.mockReturnValue(true);
        validateEmail.mockReturnValue(true);
        validatePassword.mockReturnValue(true);
    });

    it('should send a status code of 201 when a new user is successfully registered', async () => {
        // Assume there is no existing user
        User.findOne.mockResolvedValue(null);

        
        User.create.mockResolvedValue({
            id: '123',
            username: 'testuser',
            email: 'test@example.com',
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
    });

    /*it('should handle missing fields', async () => {
        req.body.username = '';
        await expect(registerUser(req, res)).rejects.toThrow('All fields must be filled!');
    });

    it('should handle duplicate user', async () => {
        User.findOne.mockResolvedValue({ username: 'testuser', email: 'test@example.com' });
        await expect(registerUser(req, res)).rejects.toThrow('Unable to register with the provided credentials');
    });*/
});