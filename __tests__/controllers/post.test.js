const { 
    getAllPosts, 
    getAllPostsByUser, 
    createPost, 
    editPost, 
    deletePost, 
    commentOnPost, 
    likePost, 
    getCommentsForPost, 
    getLikesForPost 
} = require("../../controllers/post-controller");
const { status } = require('../../utils/status');
const { constants } = require('../../utils/constants');
const logger = require('../../utils/logger');
const Post = require("../../models/post-schema");
const User = require("../../models/user-schema");


jest.mock("../../models/user-schema.js");
jest.mock("../../models/post-schema.js");
jest.mock('../../utils/logger');

describe("Post Controller", () => {
    let request, response;

    beforeEach(() => {
        request = {
            params: {
                id: "123"
            },
            body: {},
            query: {}
        };
        response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });


    describe("createPost", () => {
        it("should throw an error when the author is invalid", async () => {
            request.params.id = "";

            await expect(createPost(request, response)).rejects.toThrow("Authentication required to create a post.");

            expect(response.status).toHaveBeenCalledWith(status.UNAUTHORIZED);
            expect(logger.warn).toHaveBeenCalledWith("Unauthorized post creation attempt.");
        });

        it("should throw an error when either the title or content is an ivalid type", async () => {
            request.body.title = 2;
            request.body.content = "Valid Content";

            await expect(createPost(request, response)).rejects.toThrow("Title and content must be strings.");

            expect(response.status).toHaveBeenCalledWith(status.VALIDATION_ERROR);
        });

        it("should throw an error when either the title or content is empty", async () => {
            request.body.title = "        ";
            request.body.content = " ";

            await expect(createPost(request, response)).rejects.toThrow("Title and content must not be empty.");

            expect(response.status).toHaveBeenCalledWith(status.VALIDATION_ERROR);
        });

        it("should throw an error when the title length exceeds the limit", async () => {
            request.params.id = "123";
            request.body.title = "a".repeat(constants.MAX_POST_TITLE_LENGTH + 1);
            request.body.content = "Valid content";

            await expect(createPost(request, response)).rejects.toThrow(
                `Title must be under ${constants.MAX_POST_TITLE_LENGTH} characters.`
            );
            expect(response.status).toHaveBeenCalledWith(status.VALIDATION_ERROR);
        });

        it("should throw an error when the content length exceeds the limit", async () => {
            request.params.id = "123";
            request.body.title = "Valid Title";
            request.body.content = "a".repeat(constants.MAX_POST_CONTENT_LENGTH + 1);

            await expect(createPost(request, response)).rejects.toThrow(
                `Content must be under ${constants.MAX_POST_CONTENT_LENGTH} characters.`
            );
            expect(response.status).toHaveBeenCalledWith(status.VALIDATION_ERROR);
        });

        it("should create a post and return the necessary json data", async () => {
            request.params.id = "authorId";
            request.body.title = "Valid Title";
            request.body.content = "Valid content";

            const createdPost = {
                id: "postId",
                title: "Valid Title",
                content: "Valid content",
                authorID: "authorId"
            };

            Post.create.mockResolvedValue(createdPost);

            await createPost(request, response);

            expect(Post.create).toHaveBeenCalledWith({
                title: "Valid Title",
                content: "Valid content",
                authorID: "authorId"
            });

            expect(logger.info).toHaveBeenCalledWith(
                `New post created by user authorId with ID: ${createdPost.id}`
            );

            expect(response.status).toHaveBeenCalledWith(status.CREATED);
            expect(response.json).toHaveBeenCalledWith({ post: createdPost });
        });
    });

    describe("getAllPostsByUser", () => {
        it("should throw an error if the user does not exist", async () => {
            request.params.username = "nonexistent";
            User.findOne.mockResolvedValue(null);

            await expect(getAllPostsByUser(request, response)).rejects.toThrow("User does not exist!");
            expect(logger.warn).toHaveBeenCalledWith("User not found: nonexistent");
            expect(response.status).toHaveBeenCalledWith(status.NOT_FOUND);
        });

        it("should return paginated posts for a user", async () => {
            request.params.username = "testuser";
            request.query.page = "2";
            const userDB = { id: "userId", _id: "userId", username: "testuser" };
            User.findOne.mockResolvedValue(userDB);

            const userPosts = [
                { id: "post1", author_id: "userId" },
                { id: "post2", author_id: "userId" }
            ];
            Post.find.mockReturnValue({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(userPosts)
            });
            Post.countDocuments.mockResolvedValue(12);

            await getAllPostsByUser(request, response);

            expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
            expect(Post.find).toHaveBeenCalledWith({ author_id: "userId" });
            expect(Post.countDocuments).toHaveBeenCalledWith({ author_id: "userId" });
            expect(logger.info).toHaveBeenCalledWith("Found the user testuser with ID: userId");
            expect(logger.info).toHaveBeenCalledWith("Fetched 2 posts for user testuser");
            expect(response.status).toHaveBeenCalledWith(status.OK);
            expect(response.json).toHaveBeenCalledWith({
                userPosts,
                page: 2,
                totalPages: Math.ceil(12 / constants.POSTS_PER_PAGE_LIMIT),
                totalPosts: 12
            });
        });
    });
});