const asyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const Post = require("../models/post-schema");
const User = require("../models/user-schema"); 
const logger = require("../utils/logger");
const { constants } = require("../utils/constants");
const { validateUsername } = require("../utils/input-validator");
const redisClient = require("../config/redis-client");
const { clearPostCache } = require("../utils/cache-utils");


/**
 * @function createPost
 * @description
 * Handles an HTTP POST request to create a new blog post.
 * Requires an authenticated user identified by `author_id` query parameter.
 * Validates input data (title and content), enforces length limits,
 * clears any relevant cache, and stores the post in the database.
 *
 * @route POST /api/posts
 * @access Private
 *
 * @param {import('express').Request} request - Express request object. 
 *   Expects `title` and `content` in the JSON body, and `author_id` as a query parameter.
 * @param {import('express').Response} response - Express response object used to return the created post.
 *
 * @returns {Response} 201 - Returns the created post object on success.
 * @returns {Response} 401 - If `author_id` is missing, meaning unauthorized.
 * @returns {Response} 404 - If no user is found for the provided `author_id`.
 * @returns {Response} 422 - For validation errors like missing or invalid fields.
 *
 * @throws {Error} Throws errors for missing user, validation failures, or unauthorized access (handled by asyncHandler).
 *
 * @example
 * // Client request:
 * POST /api/posts?author_id=609d6c9b3f1d2b001f89f100
 * {
 *   "title": "My First Post",
 *   "content": "This is the content of my first post."
 * }
 *
 * // Sample response:
 * {
 *   "post": {
 *     "_id": "60a6b9d4f1e9a21e4cfa1234",
 *     "title": "My First Post",
 *     "content": "This is the content of my first post.",
 *     "author_id": "609d6c9b3f1d2b001f89f100",
 *     "createdAt": "2024-06-25T10:20:30Z",
 *     "updatedAt": "2024-06-25T10:20:30Z"
 *   }
 * }
 */
const createPost = asyncHandler(async (request, response) => {
    // Extract title and content from the request body
    const { title, content } = request.body;

    // Extract author_id from query parameters (used for authentication)
    const author_id = request.query.author_id;

    // Check if author_id is provided
    if (!author_id) {
        logger.warn("Unauthorized post creation attempt: no author_id provided.");
        response.status(status.UNAUTHORIZED);
        throw new Error("Authentication required to create a post.");
    }

    // Verify the user exists in the database
    const user = await User.findById(author_id);
    if (!user) {
        logger.error(`User not found for author_id: ${author_id}`);
        response.status(status.NOT_FOUND);
        throw new Error("User not found.");
    }

    // Validate input types
    if (typeof title !== "string" || typeof content !== "string") {
        logger.error("Invalid input types for post creation. Title and content must be strings.");
        response.status(status.VALIDATION_ERROR);
        throw new Error("Title and content must be strings.");
    }

    // Trim whitespace from title and content
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    // Validate that neither title nor content is empty after trimming
    if (!trimmedTitle || !trimmedContent) {
        logger.error("Empty title or content in post creation.");
        response.status(status.VALIDATION_ERROR);
        throw new Error("Title and content must not be empty.");
    }

    // Enforce max length constraints for title and content
    if (trimmedTitle.length > constants.MAX_POST_TITLE_LENGTH) {
        logger.error(`Post title exceeds maximum length of ${constants.MAX_POST_TITLE_LENGTH} characters.`);
        response.status(status.VALIDATION_ERROR);
        throw new Error(`Title must be under ${constants.MAX_POST_TITLE_LENGTH} characters.`);
    }

    if (trimmedContent.length > constants.MAX_POST_CONTENT_LENGTH) {
        logger.error(`Post content exceeds maximum length of ${constants.MAX_POST_CONTENT_LENGTH} characters.`);
        response.status(status.VALIDATION_ERROR);
        throw new Error(`Content must be under ${constants.MAX_POST_CONTENT_LENGTH} characters.`);
    }

    // Clear any cached post data to maintain cache consistency after creation
    logger.info("Cache cleared on post creation.");
    await clearPostCache();

    // Log the creation attempt
    logger.info(`Post creation attempt by the user: ${author_id}`);

    // Create and save the new post document
    const post = await Post.create({
        title: trimmedTitle,
        content: trimmedContent,
        author_id: author_id,
    });

    // Log success and respond with the created post object
    logger.info(`New post created by user ${author_id} with ID: ${post.id}`);

    response.status(status.CREATED).json({ post });
});


/**
 * @function getAllPosts
 * @description
 * Retrieves paginated blog posts with Redis caching to improve performance.
 * If cached data exists for the requested page, it returns that.
 * Otherwise, fetches from MongoDB, caches the result, and returns it.
 *
 * @route GET /api/posts
 * @access Public
 *
 * @param {import('express').Request} request - Express request object, expects optional query parameter `page` (default 1).
 * @param {import('express').Response} response - Express response object used to return paginated posts.
 *
 * @returns {Response} 200 - Returns an object with posts for the page, total pages, and total post count.
 *
 * @example
 * // Client request:
 * GET /api/posts?page=2
 *
 * // Sample response:
 * {
 *   "allPosts": [],
 *   "page": 2,
 *   "totalPages": 10,
 *   "totalPosts": 100
 * }
 */
const getAllPosts = asyncHandler(async (request, response) => {
    // Parse page query parameter or default to 1
    const page = parseInt(request.query.page, 10) || 1;

    // Calculate number of documents to skip for pagination
    const skip = (page - 1) * constants.POSTS_PER_PAGE_LIMIT;

    // Compose Redis cache key for this page
    const cacheKey = `posts:page:${page}`;

    // Attempt to get cached data from Redis
    const cached = await redisClient.get(cacheKey);

    if (cached) {
        logger.debug(`Cache hit for key: ${cacheKey}`);
        logger.info(`Returning cached posts for page ${page}.`);
        return response.status(status.OK).json(JSON.parse(cached));
    }

    // Fetch posts with pagination and populate author username
    const allPosts = await Post.find()
        .skip(skip)
        .limit(constants.POSTS_PER_PAGE_LIMIT)
        .sort({ createdAt: -1 })
        .populate("author_id", "username");

    // Get total post count for pagination metadata
    const total = await Post.countDocuments();

    // Construct response payload with pagination info
    const responseData = {
        allPosts,
        page,
        totalPages: Math.ceil(total / constants.POSTS_PER_PAGE_LIMIT),
        totalPosts: total,
    };

    logger.info(`Fetched posts from DB for page ${page}, total posts: ${total}.`);

    // Cache the response for 1 hour (3600 seconds)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    logger.info(`Cache set successfully for key: ${cacheKey}`);

    // Send response to client
    response.status(status.OK).json(responseData);
});


/**
 * @function getAllPostsByUser
 * @description
 * Retrieves paginated blog posts authored by a specific user, identified by username.
 * Uses Redis to cache responses for performance optimization.
 *
 * @route GET /api/posts/user/:username
 * @access Public
 *
 * @param {import('express').Request} request - Express request object
 * @param {import('express').Response} response - Express response object
 */
const getAllPostsByUser = asyncHandler(async (request, response) => {
    const { username } = request.params;
    const page = parseInt(request.query.page, 10) || 1;

    // Validate presence of username
    if (!username) {
        logger.error("Missing username field in request params.");
        response.status(status.VALIDATION_ERROR);
        throw new Error("Username must be provided.");
    }

    // Validate username format
    if (!validateUsername(username)) {
        logger.error(`Invalid username format: ${username}`);
        response.status(status.VALIDATION_ERROR);
        throw new Error("Invalid username.");
    }

    const cacheKey = `posts:user:${username}:page:${page}`;

    logger.info(`Checking cache for key: ${cacheKey}`);
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
        logger.info(`Cache hit for user ${username} (page ${page})`);
        return response.status(status.OK).json(JSON.parse(cachedData));
    }

    logger.info(`Cache miss for user ${username} (page ${page}), querying database...`);

    const skip = (page - 1) * constants.POSTS_PER_PAGE_LIMIT;

    // Find user by username
    const userDB = await User.findOne({ username });

    if (!userDB) {
        logger.warn(`User not found: ${username}`);
        response.status(status.NOT_FOUND);
        throw new Error("User does not exist.");
    }

    logger.info(`User found: ${username} with ID: ${userDB._id}`);

    // Query user's posts
    const userPosts = await Post.find({ author_id: userDB._id })
        .skip(skip)
        .limit(constants.POSTS_PER_PAGE_LIMIT)
        .sort({ createdAt: -1 });

    const totalPosts = await Post.countDocuments({ author_id: userDB._id });

    const responseData = {
        userPosts,
        page,
        totalPages: Math.ceil(totalPosts / constants.POSTS_PER_PAGE_LIMIT),
        totalPosts
    };

    // Cache the response for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
    logger.info(`Cached result for ${cacheKey}`);

    response.status(status.OK).json(responseData);
});

/**
 * @function editPost
 * @description
 * Allows an authenticated user to edit their own blog post by providing a new title and content.
 * Validates ownership, input types, character limits, and ensures the post exists before updating.
 * Clears the cache after a successful edit to keep data fresh.
 *
 * @route PATCH /api/posts/:postId
 * @access Private
 *
 * @param {import('express').Request} request - Express request object containing:
 *    - postId in `params`
 *    - updated `title` and `content` in `body`
 *    - authenticated user's ID in `request.user.id`
 * @param {import('express').Response} response - Express response object used to send back updated post data.
 *
 * @returns {Response} 200 - Success message with updated post object.
 *
 * @throws {Error}
 *    - 401 UNAUTHORIZED if user is not authenticated.
 *    - 403 FORBIDDEN if the user is not the author of the post.
 *    - 404 NOT_FOUND if the post does not exist.
 *    - 422 VALIDATION_ERROR if input is invalid or exceeds max limits.
 *
 * @example
 * // Client request:
 * PATCH /api/posts/abc123
 * {
 *   "title": "Updated Post Title",
 *   "content": "Updated post content."
 * }
 *
 * // Sample response:
 * {
 *   "message": "Post updated successfully.",
 *   "post": { ...updated post object... }
 * }
 */
const editPost = asyncHandler(async (request, response) => {
    const { title, content } = request.body;
    const { postId } = request.params;
    const userId = request.user?.id;

    if (!userId) {
        logger.warn("Unauthorized attempt to edit post.");
        response.status(status.UNAUTHORIZED);
        throw new Error("Authentication required to edit a post.");
    }

    if (typeof title !== "string" || typeof content !== "string") {
        logger.error("Invalid input types for post editing.");
        response.status(status.VALIDATION_ERROR);
        throw new Error("Title and content must be strings.");
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
        logger.error("Empty title or content in post editing.");
        response.status(status.VALIDATION_ERROR);
        throw new Error("Title and content must not be empty.");
    }

    if (trimmedTitle.length > constants.MAX_POST_TITLE_LENGTH) {
        logger.error(`Post title exceeds ${constants.MAX_POST_TITLE_LENGTH} characters.`);
        response.status(status.VALIDATION_ERROR);
        throw new Error(`Title must be under ${constants.MAX_POST_TITLE_LENGTH} characters.`);
    }

    if (trimmedContent.length > constants.MAX_POST_CONTENT_LENGTH) {
        logger.error(`Post content exceeds ${constants.MAX_POST_CONTENT_LENGTH} characters.`);
        response.status(status.VALIDATION_ERROR);
        throw new Error(`Content must be under ${constants.MAX_POST_CONTENT_LENGTH} characters.`);
    }

    const post = await Post.findById(postId);

    if (!post) {
        logger.warn(`Edit failed: Post with id ${postId} not found.`);
        response.status(status.NOT_FOUND);
        throw new Error("Post not found.");
    }

    if (String(post.author_id) !== String(userId)) {
        logger.warn(`User ${userId} attempted to edit post ${postId} without permission.`);
        response.status(status.FORBIDDEN);
        throw new Error("You do not have permission to edit this post.");
    }

    // Clear cache
    logger.info("Cache cleared on post editing!");
    await clearPostCache();

    post.title = trimmedTitle;
    post.content = trimmedContent;
    await post.save();

    logger.info(`Post ${postId} edited by user ${userId}.`);

    response.status(status.OK).json({ 
        message: "Post updated successfully.", 
        post 
    });
});


/**
 * @function deletePost
 * @description
 * Allows an authenticated user to delete one of their own blog posts.
 * Validates authentication and post ownership, and ensures the post exists before deletion.
 * Clears cached post data after deletion to maintain consistency.
 *
 * @route DELETE /api/posts/:postId
 * @access Private
 *
 * @param {import('express').Request} request - Express request object containing:
 *    - postId in `params`
 *    - authenticated user's ID in `request.user.id`
 * @param {import('express').Response} response - Express response object used to send confirmation.
 *
 * @returns {Response} 200 - Success message indicating the post was deleted.
 *
 * @throws {Error}
 *    - 401 UNAUTHORIZED if the user is not authenticated.
 *    - 403 FORBIDDEN if the user is not the author of the post.
 *    - 404 NOT_FOUND if the post does not exist.
 *
 * @example
 * // Client request:
 * DELETE /api/posts/abc123
 *
 * // Sample response:
 * {
 *   "message": "Post deleted successfully."
 * }
 */
const deletePost = asyncHandler( async (request, response) => {
    const { postId } = request.params;
    const userId = request.user?.id;

    if (!userId) {
        logger.warn("Unauthorized attempt to delete post.");
        response.status(status.UNAUTHORIZED);
        throw new Error("Authentication required to delete a post.");
    }

    const post = await Post.findById(postId);

    if (!post) {
        logger.warn(`Delete failed: Post with id ${postId} not found.`);
        response.status(status.NOT_FOUND);
        throw new Error("Post not found.");
    }

    if (String(post.author_id) !== String(userId)) {
        logger.warn(`User ${userId} attempted to delete post ${postId} without permission.`);
        response.status(status.FORBIDDEN);
        throw new Error("You do not have permission to delete this post.");
    }

    // Clear cache
    logger.info("Cache cleared on post deletion!");
    await clearPostCache();

    await post.deleteOne();

    logger.info(`Post ${postId} deleted by user ${userId}.`);
    response.status(status.OK).json({ 
        message: "Post deleted successfully." 
    });
});

module.exports = { getAllPosts, getAllPostsByUser, createPost, editPost, deletePost };