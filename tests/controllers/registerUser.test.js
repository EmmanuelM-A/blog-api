const { registerUser } = require('../../src/api/v1/controllers/user-controller');
const { registerUserService } = require('../../src/services/users/user-service');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../src/utils/api-error');

jest.mock('../../src/services/users/user-service');
jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
}));
jest.mock('../../src/config/configs', () => ({
    settings: { server: { NODE_ENV: 'test' }, app: {} }
}));

describe('registerUser controller', () => {
    let req, res, next;

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
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should call registerUserService with the request body', async () => {
        registerUserService.mockResolvedValue({
            id: '123',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
        });

        await registerUser(req, res, next);

        expect(registerUserService).toHaveBeenCalledWith(req.body);
    });

    it('should respond with 201 and user data on success', async () => {
        const mockUser = { id: '123', username: 'testuser', email: 'test@example.com', role: 'user' };
        registerUserService.mockResolvedValue(mockUser);

        await registerUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'User registered successfully.',
            data: {
                userId: mockUser.id,
                username: mockUser.username,
                email: mockUser.email,
                role: mockUser.role,
            }
        });
    });

    it('should pass errors from registerUserService to next', async () => {
        const error = new ApiError('Unable to register with the provided credentials', StatusCodes.BAD_REQUEST, 'USER_ALREADY_EXISTS');
        registerUserService.mockRejectedValue(error);

        await registerUser(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
