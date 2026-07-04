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

- [x] **Remove `pg` dependency** — PostgreSQL is installed but never imported or used anywhere (`npm uninstall pg`)
- [x] **Remove `express-validator`** — installed but unused; input validation is handled manually in the service layer (`npm uninstall express-validator`)
- [x] **Delete `docker-checker.yml`** — superseded by the new reusable `docker.yml` called from `ci.yml`

---

## Features

Additions that would make the API stand out without over-engineering it.

### ~~1. Search & filter on posts~~

~~Add query param support to `GET /api/v1/posts`.~~

### ~~2. Tags on posts~~

~~Add a `tags` array field to the Post schema and filter by tag.~~

### ~~3. File logging~~

~~Add `winston-daily-rotate-file` transports for error and combined logs.~~

### ~~4. Tighter rate limiting on auth routes~~

~~Apply a stricter limiter (10 req / 15 min) to `POST /login` and `POST /register`.~~

### ~~5. Pagination on likes~~

~~Add `page` and `limit` query params to `GET /posts/likes/:postId`.~~
