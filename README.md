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

### Build Production Image

```bash
npm run docker:build:prod
```

### Run Production Container

```bash
npm run docker:run:prod
```

### Run Development Compose

```bash
npm run docker:compose:dev
```

### Run Production Compose

```bash
npm run docker:compose:prod
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
