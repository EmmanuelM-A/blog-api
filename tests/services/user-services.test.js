const { StatusCodes } = require("http-status-codes");
const { createUser, findUserByCriteria } = require("../../src/database/models/user-model");
const { registerUserService, loginUserService } = require("../../src/services/users/user-service");
const { validateUsername, validateEmail, validatePassword } = require("../../src/services/validation/input-validator");
const { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } = require("../../src/utils/helpers");
const { expectApiError } = require("../config");

jest.mock("../../src/services/validation/input-validator");
jest.mock("../../src/utils/helpers");
jest.mock("../../src/database/models/user-model");
jest.mock("../../src/utils/logger", () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
}));
jest.mock("../../src/config/configs", () => ({
    settings: {
        app: { ACCESS_TOKEN_SECRET: 'testsecret', REFRESH_TOKEN_SECRET: 'refreshsecret' },
        server: { NODE_ENV: 'test' }
    }
}));


describe("User Services", () => {

    describe("registerUserService", () => {
        let mockUserCredentials;

        beforeEach(() => {
            mockUserCredentials = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password123!'
            };

            validateUsername.mockReset();
            validateEmail.mockReset();
            validatePassword.mockReset();
            hashPassword.mockReset();
            createUser.mockReset();
            findUserByCriteria.mockReset();

            validateUsername.mockReturnValue(true);
            validateEmail.mockReturnValue(true);
            validatePassword.mockReturnValue(true);
        });

        it("should throw an ApiError with status 400 if any credentials are missing", async () => {
            mockUserCredentials.username = "";

            await expectApiError(
                () => registerUserService(mockUserCredentials),
                StatusCodes.BAD_REQUEST
            );
        });

        it("should throw an ApiError with status 400 if username is invalid", async () => {
            validateUsername.mockReturnValue(false);

            await expectApiError(
                () => registerUserService(mockUserCredentials),
                StatusCodes.BAD_REQUEST
            );
        });

        it("should throw an ApiError with status 400 if email is invalid", async () => {
            validateEmail.mockReturnValue(false);

            await expectApiError(
                () => registerUserService(mockUserCredentials),
                StatusCodes.BAD_REQUEST
            );
        });

        it("should throw an ApiError with status 400 if password is invalid", async () => {
            validatePassword.mockReturnValue(false);

            await expectApiError(
                () => registerUserService(mockUserCredentials),
                StatusCodes.BAD_REQUEST
            );
        });

        it("should throw an ApiError with status 400 if a user with the same credentials exists", async () => {
            findUserByCriteria.mockResolvedValue({ _id: "abc123" });

            await expectApiError(
                () => registerUserService(mockUserCredentials),
                StatusCodes.BAD_REQUEST,
                "Unable to register with the provided credentials"
            );
        });

        it("should throw an ApiError with status 400 if user creation fails", async () => {
            findUserByCriteria.mockResolvedValue(null);
            hashPassword.mockResolvedValue(mockUserCredentials.password);
            createUser.mockResolvedValue(null);

            await expectApiError(
                () => registerUserService(mockUserCredentials),
                StatusCodes.BAD_REQUEST,
                "An error occurred during user registration!"
            );
        });

        it("should return the created user object on success", async () => {
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
                id: "user-id-1",
                username: "testuser",
                email: "test@example.com",
                role: "user",
                password: "hashedPassword123",
                save: jest.fn().mockResolvedValue({})
            };

            findUserByCriteria.mockReset();
            comparePassword.mockReset();
            generateAccessToken.mockReset();
            generateRefreshToken.mockReset();

            validateEmail.mockReturnValue(true);
            validatePassword.mockReturnValue(true);
        });

        it("should throw an ApiError with status 400 if credentials are missing", async () => {
            mockCredentials.email = "";

            await expectApiError(
                () => loginUserService(mockCredentials),
                StatusCodes.BAD_REQUEST
            );
        });

        it("should throw an ApiError with status 401 if user does not exist", async () => {
            findUserByCriteria.mockResolvedValue(null);

            await expectApiError(
                () => loginUserService(mockCredentials),
                StatusCodes.UNAUTHORIZED
            );
        });

        it("should throw an ApiError with status 401 if password is incorrect", async () => {
            findUserByCriteria.mockResolvedValue(mockUser);
            comparePassword.mockResolvedValue(false);

            await expectApiError(
                () => loginUserService(mockCredentials),
                StatusCodes.UNAUTHORIZED
            );
        });

        it("should return user and tokens when credentials are valid", async () => {
            findUserByCriteria.mockResolvedValue(mockUser);
            comparePassword.mockResolvedValue(true);
            generateAccessToken.mockReturnValue("access-token");
            generateRefreshToken.mockReturnValue("refresh-token");

            const result = await loginUserService(mockCredentials);

            expect(result.accessToken).toBe("access-token");
            expect(result.refreshToken).toBe("refresh-token");
            expect(result.userDB).toMatchObject({
                _id: "user-id-1",
                username: "testuser",
                email: "test@example.com",
                role: "user"
            });

            expect(comparePassword).toHaveBeenCalledWith("Password123!", mockUser.password);
            expect(generateAccessToken).toHaveBeenCalledWith("user-id-1");
            expect(generateRefreshToken).toHaveBeenCalledWith("user-id-1");
            expect(mockUser.save).toHaveBeenCalled();
        });
    });
});
