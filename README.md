# Blog API

A full-featured RESTful Blog API built with **Node.js**, **Express**, and **MongoDB**, featuring user authentication, role-based access control, post management, comments, likes, caching with **Redis**, and API documentation using Swagger.

---

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

---

## 📁 Project Structure

```bash
src/
├── api/
│   └── v1/
│       ├── controllers/
│       ├── routes/
│       └── middleware/
├── config/
├── services/
├── database/
│   └── models/
├── utils/
├── tests/
├── docs/
│   └── swagger.yaml
```

---

## Running the Project

### 🔧 Prerequisites

- Node.js v18+
- Docker + Docker Compose
- MongoDB & Redis (via Docker)

### 📦 Installation

```bash
npm install
```

### ▶️ Run the API (Development)

```bash
npm run dev
```

### 🐳 Run with Docker

```bash
docker-compose up --build
```

---

## 🛡️ Authentication

- JWT Access Token in `Authorization: Bearer <token>`.

- Refresh Token in secure HTTP-only cookie.

- Supports user login/logout and token refreshing.

## 🧑‍💻 Roles & Access

user ---> Default registered user
author ---> Automatically promoted after 1st post
admin ---> Full access to all user/admin routes

## 📄 API Documentation

Swagger UI available at: (API Documentation)[<domain>/api-docs]

**Live preview of all endpoints, request/response schemas, and error codes.**

## 📝 License

(View License Here)[]

## 👨‍🏫 Author

(Emmanuel Maduka Agbeze)[https://github.com/EmmanuelM-A]
