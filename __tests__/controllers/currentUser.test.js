const { currentUser } = require("../../controllers/user-controller");
const { status } = require("../../utils/status");
const logger = require("../../utils/logger");

jest.mock("../../utils/logger");

describe("currentUser", () => {
    let request, response;

    beforeEach(() => {
        request = {
            user: {
                id: "123",
                username: "testuser",
                email: "test@example.com",
                role: "user"
            }
        };
        response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        logger.info.mockClear();
    });

    it("should return the current user with status OK", async () => {
        await currentUser(request, response);

        expect(response.status).toHaveBeenCalledWith(status.OK);

        expect(response.json).toHaveBeenCalledWith(request.user);

        expect(logger.info).toHaveBeenCalledWith(`Fetched current user: ${request.user?.email || "unknown email"}`);
    });
});