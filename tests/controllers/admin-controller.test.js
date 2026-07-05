const { getAllUsers, deleteUser, updateUserRole } = require('../../src/api/v1/controllers/admin-controller');
const { getAllUsersService, deleteUserByIdService, updateUserRoleService } = require('../../src/services/users/admin-service');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../src/utils/api-error');

jest.mock('../../src/services/users/admin-service');
jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
}));

describe('Admin Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = { params: { userId: '123' }, body: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should respond with 200 and all users on success', async () => {
            const mockData = { users: [{ username: 'user1' }, { username: 'user2' }], totalUsers: 2, page: 1, totalPages: 1 };
            getAllUsersService.mockResolvedValue(mockData);

            await getAllUsers(req, res, next);

            expect(getAllUsersService).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Registered users fetched successfully.',
                data: mockData
            });
        });

        it('should pass errors to next', async () => {
            const error = new Error('DB error');
            getAllUsersService.mockRejectedValue(error);

            await getAllUsers(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteUser', () => {
        it('should respond with 200 and success message when user is deleted', async () => {
            const mockUser = { id: '123', username: 'user1' };
            deleteUserByIdService.mockResolvedValue(mockUser);

            await deleteUser(req, res, next);

            expect(deleteUserByIdService).toHaveBeenCalledWith('123');
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: `User ${mockUser.username} deleted successfully.`
            });
        });

        it('should pass a 404 error to next if user is not found', async () => {
            const error = new ApiError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
            deleteUserByIdService.mockRejectedValue(error);

            await deleteUser(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateUserRole', () => {
        it('should respond with 200 and updated role info on success', async () => {
            req.body.role = 'author';
            const mockResult = {
                userDB: { id: '123', username: 'user1' },
                oldRole: 'user',
                role: 'author'
            };
            updateUserRoleService.mockResolvedValue(mockResult);

            await updateUserRole(req, res, next);

            expect(updateUserRoleService).toHaveBeenCalledWith('123', req.body);
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: `The user ${mockResult.userDB.username}'s role has been updated successfully!`,
                data: { userId: mockResult.userDB.id, oldRole: 'user', newRole: 'author' }
            });
        });

        it('should pass errors to next if validation or user lookup fails', async () => {
            const error = new ApiError('Invalid role', StatusCodes.BAD_REQUEST, 'INVALID_ROLE');
            updateUserRoleService.mockRejectedValue(error);

            await updateUserRole(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
