const { StatusCodes } = require("http-status-codes");
const { createUser, findUserByCriteria } = require("../../src/database/models/user-model");
const { registerUserService, loginUserService } = require("../../src/services/users/user-service");
const { validateUsername, validateEmail, validatePassword } = require("../../src/services/validation/input-validator");
const { hashPassword } = require("../../src/utils/helpers");
const { expectApiError } = require("../config");
const { comparePassword, generateAccessToken, generateRefreshToken } = require("../../src/utils/helpers");


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
        let mockCredentials;
        let mockUser;

        beforeEach(() => {
            mockCredentials = {
                email: "test@example.com",
                password: "Password123!"
            };

            mockUser = {
                _id: "user-id-1",
                username: "testuser",
                email: "test@example.com",
                role: "user",
                password: "hashedPassword123"
            };

            // Reset and mock everything
            findUserByCriteria.mockReset();
            comparePassword.mockReset();
            generateAccessToken.mockReset();
            generateRefreshToken.mockReset();
        });

        it("should throw an ApiError with 400 if credentials are missing", async () => {
            mockCredentials.email = "";

            await expectApiError(
                () => loginUserService(mockCredentials),
                StatusCodes.BAD_REQUEST
            );
        });

        it("should throw an ApiError with 401 if user does not exist", async () => {
            findUserByCriteria.mockResolvedValue(null);

            await expectApiError(
                () => loginUserService(mockCredentials),
                StatusCodes.UNAUTHORIZED
            );
        });

        it("should throw an ApiError with 401 if password is incorrect", async () => {
            findUserByCriteria.mockResolvedValue(mockUser);
            comparePassword.mockResolvedValue(false);

            await expectApiError(
                () => loginUserService(mockCredentials),
                StatusCodes.UNAUTHORIZED
            );
        });

        it("should return user and tokens if credentials are valid", async () => {
            findUserByCriteria.mockResolvedValue(mockUser);
            comparePassword.mockResolvedValue(true);
            generateAccessToken.mockReturnValue("access-token");
            generateRefreshToken.mockReturnValue("refresh-token");

            const result = await loginUserService(mockCredentials);

            expect(result).toEqual({
                userDB: {
                    id: mockUser._id,
                    username: mockUser.username,
                    email: mockUser.email,
                    role: mockUser.role,
                },
                accessToken: "access-token",
                refreshToken: "refresh-token"
            });

            expect(comparePassword).toHaveBeenCalledWith("Password123!", mockUser.password);
            expect(generateAccessToken).toHaveBeenCalledWith({
                id: mockUser._id,
                username: mockUser.username,
                role: mockUser.role
            });
            expect(generateRefreshToken).toHaveBeenCalledWith(mockUser._id);
        });
    });


    //describe("getCurrentUserService", () => {});

    //describe("refreshAccessTokenService", () => {});

    //describe("logoutUserService", () => {});
});