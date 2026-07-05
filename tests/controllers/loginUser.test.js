const { loginUser } = require('../../src/api/v1/controllers/user-controller');
const { loginUserService } = require('../../src/services/users/user-service');
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

describe('loginUser controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: { email: 'test@example.com', password: 'Password123!' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should call loginUserService with the request body', async () => {
        loginUserService.mockResolvedValue({
            userDB: { id: '123', username: 'testuser', email: 'test@example.com', role: 'user' },
            accessToken: 'access-token',
            refreshToken: 'refresh-token'
        });

        await loginUser(req, res, next);

        expect(loginUserService).toHaveBeenCalledWith(req.body);
    });

    it('should set a refreshToken cookie and respond with 200 on success', async () => {
        const mockUserDB = { id: '123', username: 'testuser', email: 'test@example.com', role: 'user' };
        loginUserService.mockResolvedValue({
            userDB: mockUserDB,
            accessToken: 'access-token',
            refreshToken: 'refresh-token'
        });

        await loginUser(req, res, next);

        expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.any(Object));
        expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'User logged in successfully.',
            data: {
                userId: mockUserDB.id,
                username: mockUserDB.username,
                email: mockUserDB.email,
                role: mockUserDB.role,
                token: 'access-token'
            }
        });
    });

    it('should pass errors from loginUserService to next', async () => {
        const error = new ApiError('Invalid credentials', StatusCodes.UNAUTHORIZED, 'INVALID_CREDENTIALS');
        loginUserService.mockRejectedValue(error);

        await loginUser(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
