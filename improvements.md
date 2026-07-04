# Improvements & Fixes

## Bugs

These are broken right now and should be fixed before deploying.

### 1. Invalid HTTP status code constant
`StatusCodes.VALIDATION_ERROR` does not exist in `http-status-codes` — it evaluates to `undefined`.

- **Files:** `src/services/posts/post-service.js`, `src/services/users/admin-service.js`
- **Fix:** Replace with `StatusCodes.UNPROCESSABLE_ENTITY` (422)

### 2. CORS wildcard breaks cookie-based auth
`origin: "*"` combined with `credentials: true` is rejected by browsers — refresh token cookies will never be sent.

- **File:** `src/app.js`
- **Fix:** Set `origin` to an explicit URL, e.g. `process.env.ALLOWED_ORIGIN`

### 3. Wrong model in `updateCommentDetail`
`updateCommentDetail` calls `Post.findByIdAndUpdate(...)` instead of `Comment.findByIdAndUpdate(...)`.

- **File:** `src/database/models/comment-model.js` (line 85)
- **Fix:** Change `Post` to `Comment`

### 4. Missing `path` import in swagger setup
`path.resolve(...)` is called but `path` is never imported — server crashes at startup when Swagger loads.

- **File:** `src/docs/swagger.js`
- **Fix:** Add `const path = require('path')` at the top

### 5. Typo in admin service constant
`constants.POST_PER_PAGE_LIMIT` (missing `S`) evaluates to `undefined`, so pagination silently falls back to a second lookup.

- **File:** `src/services/users/admin-service.js` (line 20)
- **Fix:** Change to `constants.POSTS_PER_PAGE_LIMIT`

### 6. Stale test file with broken imports
`__tests__/controllers/post.test.js` imports from paths that no longer exist in the project layout — the test suite will fail.

- **File:** `src/__tests__/controllers/post.test.js`
- **Fix:** Update import paths to match the current project structure

---

## Cleanup

Small removals that reduce noise and confusion.

- **Remove `pg` dependency** — PostgreSQL is installed but never imported or used anywhere (`npm uninstall pg`)
- **Remove `express-validator`** — installed but unused; input validation is handled manually in the service layer (`npm uninstall express-validator`)
- **Delete `docker-checker.yml`** — superseded by the new reusable `docker.yml` called from `ci.yml`; having both causes duplicate runs on push to `main`

---

## Features

Additions that would make the API stand out without over-engineering it.

### 1. Search & filter on posts
Add query param support to `GET /api/v1/posts`.

```
GET /posts?q=keyword&author=username&sort=latest
```

- Add a text index to the Post schema on `title` and `content`
- Handle filtering in `post-service.js` before the Redis cache key is built

### 2. Tags on posts
Add a `tags` array field to the Post schema and filter by tag.

```
GET /posts?tag=javascript
POST /posts  { "title": "...", "content": "...", "tags": ["javascript", "node"] }
```

- Schema change: `tags: [{ type: String }]`
- Add tag to the Redis cache key so per-tag pages cache independently

### 3. File logging
Winston is already configured and the `logs/` directory exists — it just needs a file transport added.

- **File:** `src/utils/logger.js`
- Add a `winston.transports.File` with daily rotation (`winston-daily-rotate-file`)
- Error-level logs → `logs/error.log`, combined → `logs/combined.log`

### 4. Tighter rate limiting on auth routes
The current blanket limit (100 req / 15 min) is too loose for login and register.

- **File:** `src/middleware/api-rate-limiter.js`
- Add a stricter limiter (e.g. 10 req / 15 min) applied only to `POST /login` and `POST /register`

### 5. Pagination on likes
`getLikesForPostService` returns every like for a post in a single unbounded query.

- **File:** `src/services/likes/like-service.js`
- Add `page` and `limit` query params, matching the pattern used by posts and comments
