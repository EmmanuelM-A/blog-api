const { StatusCodes } = require("http-status-codes");
const { createUser, findUserByCriteria } = require("../../src/database/models/user-model");
const { registerUserService } = require("../../src/services/users/user-service");
const { validateUsername, validateEmail, validatePassword } = require("../../src/services/validation/input-validator");
const { hashPassword } = require("../../src/utils/helpers");
const { expectApiError, expectSuccessfulResult } = require("../config");


// Mock the following files for use
jest.mock("../../src/services/validation/input-validator");
jest.mock("../../src/utils/helpers");
jest.mock("../../src/database/models/user-model");


describe("User Services", () => {

    describe("registerUserService", () => {
        let mockUserCredentials;

        beforeEach(() => {
            mockUserCredentials = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password123!'
            }
    
            // Reset mock states before each test
            validateUsername.mockReset();
            validateEmail.mockReset();
            validatePassword.mockReset();
            hashPassword.mockReset();
            createUser.mockReset();
            findUserByCriteria.mockReset();
    
            // Valid by default
            validateUsername.mockReturnValue(true);
            validateEmail.mockReturnValue(true);
            validatePassword.mockReturnValue(true);
        });

        it("should throw an ApiError with the status code of 400, if any of the user credentials are missing", async () => {
            mockUserCredentials.username = "";

            await expectApiError(
                () => registerUserService(mockUserCredentials),
                StatusCodes.BAD_REQUEST
            );
        });

        it("should throw an ApiError with the status code of 400, if the username is invalid", async () => {
            validateUsername.mockReturnValue(false);

            await expectApiError(
                () => registerUserService(mockUserCredentials),
                StatusCodes.BAD_REQUEST
            );
        });

        it("should throw an ApiError with the status code of 400, if the email is invalid", async () => {
            validateEmail.mockReturnValue(false);

            await expectApiError(
                () => registerUserService(mockUserCredentials),
                StatusCodes.BAD_REQUEST
            );
        });

        it("should throw an ApiError with the status code of 400, if the password is invalid", async () => {
            validatePassword.mockReturnValue(false);

            await expectApiError(
                () => registerUserService(mockUserCredentials),
                StatusCodes.BAD_REQUEST
            );
        });

        it("should throw an ApiError with the status code of 400, if a user exists with the same/similar credentials", async () => {
            findUserByCriteria.mockResolvedValue({ _id: "abc123" });

            await expectApiError(
                () => registerUserService(mockUserCredentials),
                StatusCodes.BAD_REQUEST,
                "Unable to register with the provided credentials"
            ); 
        });

        it("should throw an ApiError with the status code of 400, if an error occurs in the user creation", async () => {
            findUserByCriteria.mockResolvedValue(null);
            hashPassword.mockResolvedValue(mockUserCredentials.password);
            createUser.mockResolvedValue(null);

            await expectApiError(
                () => registerUserService(mockUserCredentials),
                StatusCodes.BAD_REQUEST,
                "An error occurred during user registration!"
            );
        });

        it("should return the created mongoDB user object with all the correct fields set with their correct values", async () => {
            const fakeUser = {
                _id: "user-id-1",
                username: mockUserCredentials.username,
                email: mockUserCredentials.email,
                role: "user"
            };

            findUserByCriteria.mockResolvedValue(null);
            hashPassword.mockResolvedValue("hashedPassword123");
            createUser.mockResolvedValue(fakeUser);

            const result = await registerUserService(mockUserCredentials);

            expect(result).toEqual(fakeUser);

            expect(findUserByCriteria).toHaveBeenCalledWith({ 
                $or: [{ username: mockUserCredentials.username }, { email: mockUserCredentials.email }]
            });

            expect(hashPassword).toHaveBeenCalledWith(mockUserCredentials.password);

            expect(createUser).toHaveBeenCalledWith({
                username: mockUserCredentials.username,
                email: mockUserCredentials.email,
                password: "hashedPassword123"
            });
        });
    });

    describe("loginUserService", () => {
        
    });

    //describe("getCurrentUserService", () => {});

    //describe("refreshAccessTokenService", () => {});

    //describe("logoutUserService", () => {});
});