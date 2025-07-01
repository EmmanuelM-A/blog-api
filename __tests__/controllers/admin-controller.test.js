const { getAllUsers, deleteUser, updateUserRole } = require("../../controllers/admin-controller");
const User = require('../../models/user-schema');
const { status } = require('../../utils/status');
const logger = require('../../utils/logger');

jest.mock('../../models/user-schema.js'); 
jest.mock('../../utils/logger');


describe("Admin Controller", () => {
    let request, response;

    beforeEach(() => {
        request = { params: { id: '123' }, body: {} };
        response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe("getAllUsers", () => {
        it("should return all registered users", async () => {
            const users = {
                "data": [{"username": "user1"}, {"username": "user2"}], 
                "message": "Registered users fetched successfully.", 
                "success": true
            };

            User.find.mockReturnValue({ select: jest.fn().mockResolvedValue(users) });

            await getAllUsers(request, response);

            expect(User.find).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(status.OK);
            //expect(response.json).toHaveBeenCalledWith(users);
            //expect(logger.info).toHaveBeenCalledWith("Registered users fetched successfully.");
        });
    });


    describe('deleteUser', () => {
        it('should delete a user if found', async () => {
            const user = { username: 'user1', id: '123', deleteOne: jest.fn().mockResolvedValue() };

            User.findById.mockResolvedValue(user);

            await deleteUser(request, response);

            expect(User.findById).toHaveBeenCalledWith('123');
            expect(user.deleteOne).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(status.OK);
            expect(response.json).toHaveBeenCalledWith({ message: `User ${user.username} deleted successfully.` });
            //expect(logger.info).toHaveBeenCalledWith(`User ${user.username} (id: ${user.id}) deleted successfully.`);
        });

        it('should return 404 if user not found', async () => {
            User.findById.mockResolvedValue(null);

            await expect(deleteUser(request, response)).rejects.toThrow('User not found');
            expect(response.status).toHaveBeenCalledWith(status.NOT_FOUND);
            expect(logger.warn).toHaveBeenCalledWith('Delete failed: User with id 123 not found.');
        });
    });

    describe('updateUserRole', () => {
        it('should update user role if valid', async () => {
            request.body.role = 'user';
            const user = { username: 'user1', id: '123', role: 'author', save: jest.fn().mockResolvedValue() };
            User.findById.mockResolvedValue(user);

            await updateUserRole(request, response);

            expect(User.findById).toHaveBeenCalledWith('123');
            expect(user.role).toBe('user');
            expect(user.save).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(status.OK);
            expect(response.json).toHaveBeenCalledWith({ message: `User ${user.username}'s role updated to user` });
            expect(logger.info).toHaveBeenCalledWith(`User ${user.username} (id: ${user.id}) role updated from author to user.`);
        });

        it('should return validation error if no role provided', async () => {
            request.body.role = undefined;

            await expect(updateUserRole(request, response)).rejects.toThrow("Role is required");
            expect(response.status).toHaveBeenCalledWith(status.VALIDATION_ERROR);
            expect(logger.warn).toHaveBeenCalledWith('Role update failed: No role provided for user id 123.');
        });

        it('should return validation error if role is invalid', async () => {
            request.body.role = 'superadmin';

            await expect(updateUserRole(request, response)).rejects.toThrow('Invalid role. Valid roles are: user, author, admin.');
            expect(response.status).toHaveBeenCalledWith(status.VALIDATION_ERROR);
            expect(logger.warn).toHaveBeenCalledWith('Role update failed: Invalid role "superadmin" provided for user id 123.');
        });

        it('should return 404 if user not found', async () => {
            request.body.role = 'admin';
            User.findById.mockResolvedValue(null);

            await expect(updateUserRole(request, response)).rejects.toThrow('User not found');
            expect(response.status).toHaveBeenCalledWith(status.NOT_FOUND);
            expect(logger.warn).toHaveBeenCalledWith('Role update failed: User with id 123 not found.');
        });
    });

});