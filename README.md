# Blog API

A full-featured RESTful Blog API built with **Node.js**, **Express**, and **MongoDB**, featuring user authentication, role-based access control, post management, comments, likes, caching with **Redis**, and API documentation using Swagger.

## 🚀 Features

- User Registration & Authentication (JWT & Refresh Tokens)
- Role-Based Access Control (`user`, `author`, `admin`)
- Post CRUD operations with pagination
- Comments and likes on posts
- Auto-promotion to `author` after first post
- Input validation and centralized error handling
- Redis caching for performance
- Swagger UI for interactive API docs
- Dockerized for easy deployment

## 📁 Project Structure

```bash
src/
├── __tests__/
├── api/
│   └── v1/
│       ├── controllers/
│       ├── routes/
├── database/
│   └── models/
│   └── schemas/
│   └── database-connection.js
├── docs/
│   └── swagger.yml
│   └── swagger.js
├── middleware/
├── services/
│   └── caching/
│   └── comments/
│   └── likes/
│   └── posts/
│   └── users/
│   └── validation/
├── utils/
├── app.js
├── config.js
├── server.js
```

## Running the Project

### 🔧 Prerequisites

- **Node.js v18+**
- **Docker** & **Docker Compose**
- **MongoDB** & **Redis** (recommended via Docker)

### 📦 Installation

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory based on the `.env.example` template and set your environment variables.

```bash
cp .env.example .env
```

### ▶️ Run the API (Development)

```bash
npm run dev
```

## 🐳 Docker Usage

### Production Environemnt

**Most production deployment sites will use Dockerfile for deployment.**

#### Build Production Image

```bash
npm run docker:build:prod
```

#### Run Production Container

```bash
npm run docker:run:prod
```

#### Running `docker-compose.prod.yml`

Build and run the Production Container using the following command:

```bash
npm run dc:prod:build
```

Run the Production Container using the following command:

```bash
npm run dc:prod
```

To stop and remove the production container, use the following command:

```bash
npm run dc:prod:down
```

To view logs from the production container, use the following command:

```bash
docker-compose -f docker-compose.prod.yml logs api
```

### Development Environment

#### Running `docker-compose.dev.yml`

Build the Development Image using the following command:

```bash
npm run dc:dev:build
```

Run the Development Container using the following command:

```bash
npm run dc:dev
```

To stop and remove the development container, use the following command:

```bash
npm run dc:dev:down
```

To view logs from the development container, use the following command:

```bash
docker-compose -f docker-compose.dev.yml logs api # Replace 'api' with your service name as defined in the docker-compose file.
```

## 🛡️ Authentication

- JWT Access Token in `Authorization: Bearer <token>`.
- Refresh Token in secure HTTP-only cookie.
- Supports user login/logout and token refreshing.

## 🧑‍💻 Roles & Access

- `user` – Default registered user
- `author` – Automatically promoted after first post
- `admin` – Full access to all user/admin routes

## 📄 API Documentation

Swagger UI available at: [API Documentation](https://blog-api-tp8c.onrender.com/api-docs)

**Live preview of all endpoints, request/response schemas, and error codes.**

## 📝 License

[MIT License](LICENSE.md)

## 👨‍🏫 Author

[Emmanuel Maduka Agbeze](https://github.com/EmmanuelM-A)
