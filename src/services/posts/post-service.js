const { StatusCodes } = require("http-status-codes");
const { findPostById, deletePostById, findPosts, countPostsByCriteria, createPost } = require("../../database/models/post-model");
const { clearCacheForKey } = require("../../services/caching/cache-utils");
const ApiError = require("../../utils/api-error");
const logger = require("../../utils/logger");
const { constants } = require("../../config");
const { validateUsername } = require("../validation/input-validator");
const redisClient = require("../caching/redis-client");
const { findUserById, updateUserDetail, findUserByCriteria } = require("../../database/models/user-model");
const Post = require("../../database/schemas/post-schema");


async function getAllPostsService(options) {
    // Parse page query parameter or default to 1
    const page = parseInt(options.page, 10) || 1;
    const limit = options.limit || constants.POSTS_PER_PAGE_LIMIT;

    // Calculate number of documents to skip for pagination
    const skip = (page - 1) * limit;

    // Compose Redis cache key for this page
    const cacheKey = `posts:page:${page}`;

    // Attempt to get cached data from Redis
    const cached = await redisClient.get(cacheKey);

    if (cached) {
        logger.debug(`Cache hit for key: ${cacheKey}`);
        logger.debug(`Returning cached posts for page ${page}.`);

        return JSON.parse(cached);
    }

    // Fetch posts with pagination and populate author username
    // Get total post count for pagination metadata
    const [allPosts, total] = await Promise.all([
        Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("author_id", "username") // Populate username from related user
            .exec(),
        Post.countDocuments()
    ]);

    // Construct response payload with pagination info
    const responseData = {
        allPosts,
        page,
        totalPages: Math.ceil(total / constants.POSTS_PER_PAGE_LIMIT),
        totalPosts: total,
    };

    logger.debug(`Fetched posts from DB for page ${page}, total posts: ${total}.`);

    // Cache the response for 1 hour (3600 seconds)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    logger.debug(`Cache set successfully for key: ${cacheKey}`);

    return responseData;
}

async function getAllPostsByUserService(username, options) {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || constants.POSTS_PER_PAGE_LIMIT;

    // Validate presence of username
    if (!username) {
        logger.error("Missing username field in request params.");

        throw new ApiError(
            "Username must be provided.",
            StatusCodes.VALIDATION_ERROR,
            "USERNAME_REQUIRED"
        );
    }

    // Validate username format
    if (!validateUsername(username)) {
        logger.error(`Invalid username format: ${username}`);

        throw new ApiError(
            "Invalid username format.",
            StatusCodes.VALIDATION_ERROR,
            "INVALID_USERNAME_FORMAT"
        );
    }

    const cacheKey = `posts:user:${username}:page:${page}`;

    logger.debug(`Checking cache for key: ${cacheKey}`);
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
        logger.debug(`Cache hit for user ${username} (page ${page})`);

        return JSON.parse(cachedData);
    }

    logger.debug(`Cache miss for user ${username} (page ${page}), querying database...`);

    const skip = (page - 1) * constants.POSTS_PER_PAGE_LIMIT;

    // Find user by username
    const userDB = await findUserByCriteria({ username });

    if (!userDB) {
        logger.warn(`User not found: ${username}`);

        throw new ApiError(
            `User with username ${username} not found.`,
            StatusCodes.NOT_FOUND,
            "USER_NOT_FOUND"
        );
    }

    logger.debug(`User found: ${username} with ID: ${userDB._id}`);

    // Query user's posts
    const [userPosts, totalPosts] = await Promise.all([
        Post.find({ author_id: userDB.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Post.countDocuments({ author_id: userDB.id })
    ]);

    const responseData = {
        userPosts,
        page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts
    };

    // Cache the response for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
    logger.debug(`Cached result for ${cacheKey}`);

    return responseData;
}

async function createPostService(userDB, postContent) {
    // Extract title and content from the request body
    const { title, content } = postContent;

    // Check if user exists or userDB object is set
    if(!userDB) {
        logger.warn("Post creation failed: The user does not exist!");

        throw new ApiError(
            "No user found or user is invalid",
            StatusCodes.NOT_FOUND,
            "USER_NOT_FOUND"
        );
    }

    const userId = userDB._id;

    // Validate input types
    if (typeof title !== "string" || typeof content !== "string") {
        logger.error("Invalid input types for post creation. Title and content must be strings.");

        throw new ApiError(
            "Title and content must be strings.",
            StatusCodes.VALIDATION_ERROR,
            "INVALID_INPUT_TYPE",
        );
    }

    // Trim whitespace from title and content
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    // Validate that neither title nor content is empty after trimming
    if (!trimmedTitle || !trimmedContent) {
        logger.error("Empty title or content in post creation.");

        throw new ApiError(
            "Title and content must not be empty.",
            StatusCodes.VALIDATION_ERROR,
            "EMPTY_TITLE_OR_CONTENT",
        );
    }

    // Enforce max length constraints for title and content
    if (trimmedTitle.length > constants.MAX_POST_TITLE_LENGTH) {
        logger.error(`Post title exceeds maximum length of ${constants.MAX_POST_TITLE_LENGTH} characters.`);

        throw new ApiError(
            `Title must be under ${constants.MAX_POST_TITLE_LENGTH} characters.`,   
            StatusCodes.VALIDATION_ERROR,
            "TITLE_TOO_LONG",
        );
    }

    if (trimmedContent.length > constants.MAX_POST_CONTENT_LENGTH) {
        logger.error(`Post content exceeds maximum length of ${constants.MAX_POST_CONTENT_LENGTH} characters.`);

        throw new ApiError(
            `Content must be under ${constants.MAX_POST_CONTENT_LENGTH} characters.`,
            StatusCodes.VALIDATION_ERROR,
            "CONTENT_TOO_LONG",
        );
    }

    const cacheKey = `posts:user:${userDB.username}:page:${1}`;

    // Clear any cached post data to maintain cache consistency after creation
    await clearCacheForKey('posts:user:*');
    logger.debug("Cache cleared on post creation!");

    // Get the number of posts user has made
    const postsByUser = await findPosts({ user_id: userId });

    // Check if its the user's first post, if so update their role to author
    if(userDB.role === "user" && postsByUser.length === 0) {
        await updateUserDetail(userId, "role", "author");
    }

    // Log the creation attempt
    logger.debug(`Post creation attempt by the user: ${userId}`);

    // Create and save the new post document
    const post = await createPost({
        title: trimmedTitle,
        content: trimmedContent,
        author_id: userId,
    });

    return post;
}

async function editPostService(user, postId, newContent) {
    const { title, content } = newContent;

    const userId = user?.id;

    if (!userId) {
        logger.warn("Unauthorized attempt to edit post.");

        throw new ApiError(
            "Authentication required to edit a post.",
            StatusCodes.UNAUTHORIZED,
            "UNAUTHORIZED_EDIT"
        );
    }

    if (typeof title !== "string" || typeof content !== "string") {
        logger.error("Invalid input types for post editing.");

        throw new ApiError(
            "Title and content must be strings.",
            StatusCodes.VALIDATION_ERROR,
            "INVALID_INPUT_TYPE"
        );
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
        logger.error("Empty title or content in post editing.");

        throw new ApiError(
            "Title and content must not be empty.",
            StatusCodes.VALIDATION_ERROR,
            "EMPTY_TITLE_OR_CONTENT"
        );
    }

    if (trimmedTitle.length > constants.MAX_POST_TITLE_LENGTH) {
        logger.error(`Post title exceeds ${constants.MAX_POST_TITLE_LENGTH} characters.`);

        throw new ApiError(
            `Title must be under ${constants.MAX_POST_TITLE_LENGTH} characters.`,
            StatusCodes.VALIDATION_ERROR,
            "TITLE_TOO_LONG"
        );
    }

    if (trimmedContent.length > constants.MAX_POST_CONTENT_LENGTH) {
        logger.error(`Post content exceeds ${constants.MAX_POST_CONTENT_LENGTH} characters.`);

        throw new ApiError(
            `Content must be under ${constants.MAX_POST_CONTENT_LENGTH} characters.`,
            StatusCodes.VALIDATION_ERROR,
            "CONTENT_TOO_LONG"
        );
    }

    const postDB = await findPostById(postId);

    if (!postDB) {
        logger.warn(`Edit failed: Post with id ${postId} not found.`);

        throw new ApiError(
            `Post with id ${postId} not found.`,
            StatusCodes.NOT_FOUND,
            "POST_NOT_FOUND"
        );
    }

    if (String(postDB.author_id) !== String(userId)) {
        logger.warn(`User ${userId} attempted to edit post ${postId} without permission.`);
        throw new ApiError(
            `The user ${user.username} does not have the permissions to edit this post.`,
            StatusCodes.FORBIDDEN,
            "FORBIDDEN_EDIT"
        );
    }

    // Clear cache
    logger.debug("Cache cleared on post editing!");
    await clearCacheForKey("posts:page:*");

    postDB.title = trimmedTitle;
    postDB.content = trimmedContent;
    await postDB.save();

    return postDB;
}

async function deletePostService(user, postId) {
    const userId = user?.id;

    if (!userId) {
        logger.warn("Unauthorized attempt to delete post.");

        throw new ApiError(
            "Authentication required to delete a post.",
            StatusCodes.UNAUTHORIZED,
            "UNAUTHORIZED_DELETE"
        );
    }
    const post = await findPostById(postId);

    if (!post) {
        logger.warn(`Delete failed: Post with id ${postId} not found.`);

        throw new ApiError(
            `Post with id ${postId} not found.`,
            StatusCodes.NOT_FOUND,
            "POST_NOT_FOUND"
        );
    }

    const isAdmin = user.role === "admin";
    const isOwner = String(post.author_id) === String(user._id);

    if (!isAdmin && !isOwner) {
        logger.warn(`User ${userId} attempted to delete post ${postId} without permission.`);

        throw new ApiError(
            `The user ${user.username} does not have the permissions to delete this post.`,
            StatusCodes.FORBIDDEN,
            "FORBIDDEN_DELETE"
        );
    }

    // Clear cache
    logger.debug("Cache cleared on post deletion!");
    await clearCacheForKey('posts:page:*');

    await deletePostById(postId);
}

module.exports = { getAllPostsByUserService, getAllPostsService, deletePostService, createPostService, editPostService };