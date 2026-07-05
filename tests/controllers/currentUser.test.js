const { currentUser } = require('../../src/api/v1/controllers/user-controller');
const { getCurrentUserService } = require('../../src/services/users/user-service');
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

describe('currentUser controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            user: { id: '123', username: 'testuser', email: 'test@example.com', role: 'user' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should call getCurrentUserService with the authenticated user id', async () => {
        getCurrentUserService.mockResolvedValue({ id: '123', username: 'testuser', email: 'test@example.com', role: 'user' });

        await currentUser(req, res, next);

        expect(getCurrentUserService).toHaveBeenCalledWith('123');
    });

    it('should respond with 200 and the user data', async () => {
        const mockUser = { id: '123', username: 'testuser', email: 'test@example.com', role: 'user' };
        getCurrentUserService.mockResolvedValue(mockUser);

        await currentUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Current user fetched successfully.',
            data: { user: mockUser }
        });
    });

    it('should pass errors from getCurrentUserService to next', async () => {
        const error = new ApiError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
        getCurrentUserService.mockRejectedValue(error);

        await currentUser(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
