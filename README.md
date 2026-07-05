# Blog API

A REST API for a blogging platform built with **Node.js**, **Express**, **MongoDB**, and **Redis**.

**Live API Docs:** [Live Demo](https://blog-api-production-b62c.up.railway.app/api-docs)

## Features

- User registration and login with JWT authentication
- Role-based access: `user`, `author`, `admin`
- Create, edit, and delete blog posts with pagination
- Search and filter posts by keyword, author, or tag
- Comments and likes on posts
- New users are automatically promoted to `author` after their first post
- Redis caching on frequently read endpoints
- Interactive API docs via Swagger UI

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js 18 |
| Framework | Express v5 |
| Database | MongoDB (Mongoose) |
| Cache | Redis |
| Auth | JWT (access + refresh tokens) |
| Docs | Swagger / OpenAPI 3.1 |
| Deployment | Railway |

## Project Structure

```text
src/
├── api/v1/
│   ├── controllers/
│   └── routes/
├── config/
├── database/
│   ├── models/
│   └── schemas/
├── docs/
├── middleware/
├── services/
│   ├── caching/
│   ├── comments/
│   ├── likes/
│   ├── posts/
│   ├── users/
│   └── validation/
└── utils/
```

## Getting Started

### Prerequisites

- Node.js v18+
- Docker and Docker Compose (for local MongoDB and Redis)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Key variables:

```env
MONGO_URI=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
```

### 3. Start MongoDB and Redis

```bash
npm run db:up
```

### 4. Run the API

```bash
npm run dev
```

### Seed an admin user (optional)

```bash
npm run seed
```

## Docker

The `docker-compose.yml` runs MongoDB and Redis locally. The `Dockerfile` builds the production image used for deployment.

```bash
# Start local databases
npm run db:up

# Stop local databases
npm run db:down

# Stop and remove volumes
npm run db:clear
```

## Authentication

- Login returns a short-lived **access token** (5 min) in the response body
- A **refresh token** (7 days) is stored in an HTTP-only cookie
- Use `Authorization: Bearer <access_token>` on protected routes

## Roles

| Role | Access |
| --- | --- |
| `user` | Register, login, comment, like |
| `author` | All of the above + create/edit/delete own posts |
| `admin` | Full access including user management |

## API Documentation

Swagger UI is available at `/api-docs` when running locally.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start in development mode with hot reload |
| `npm start` | Start in production mode |
| `npm test` | Run tests |
| `npm run lint` | Lint the codebase |
| `npm run seed` | Seed an admin user |
| `npm run db:up` | Start local MongoDB and Redis via Docker |
| `npm run bundle-docs` | Bundle Swagger docs into a single file |

## License

[MIT](LICENSE.md)

## Author

[Emmanuel Maduka Agbeze](https://github.com/EmmanuelM-A)
