# Fitness Tracker REST API

## Overview

A fitness tracker REST API, allowing users to log workouts, manage exercises, track progress, and create reusable workout templates.

---

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)

---

## Architecture

### Back-End Framework

- Built with **JavaScript** and **Express.js**
- Uses Express's middleware and routing functionality for modular routes/middleware/error-handling

### Data Management

- **PostgreSQL:** Database Management System
- **Prisma:** Database configuration and Schema management
- **Prisma CLient:** Object-Relational Mapping

### Authentication/Authorization

- **JSON Web Tokens:**
  - Short-lived access tokens for secure request authentication
  - Longer-lived, hashed refresh tokens temporarily stored in database for secure persistent login
- **Bcrypt:** Password and refresh-token hashing
- Authorization system, permitting only allowed users to access and modify resources

### Validation

- **Express-validator:**
  - Request validation and sanitisation
  - Clear error responses for invalid requests

### Testing

- **Jest:** Testing framework
- **Supertest:** Simulate HTTP requests to facilitate integration testing

### Environment

- .env file required for managing environment variables
- **Dotenv:** Secure injection of environment variables at runtime

### Misc

- **Helmet:** Adds HTTP headers to secure the app
- **Prettier:** Code formatting
- **Health Check Endpoint:** Simple GET `/health` route to verify API is running

---

## Project Structure

```text
  .
  ├── .env                  # Environment variables
  ├── .git/                 # Git version-control tracking
  ├── .gitignore
  ├── generated
  │   └── prisma/           # Auto-generated Prisma Client output
  ├── node_modules/
  ├── package-lock.json
  ├── package.json
  ├── prisma
  │   ├── migrations/       # Auto-generated Prisma database schema migration files
  │   ├── prisma.js         # Prisma client config/instance
  │   └── schema.prisma     # Prisma database schema definition
  ├── README.md
  ├── src
  │   ├── app.js            # Central Express application setup (middleware, routes, error handling)
  │   ├── controllers       # Request handlers (business logic for each route)
  │   │   ├── auth.js
  │   │   ├── exercises.js
  │   │   ├── muscleGroups.js
  │   │   ├── users.js
  │   │   ├── workoutSessions.js
  │   │   └── workoutTemplates.js
  │   ├── middleware        # General/reusable middleware
  │   │   ├── asyncErrorHandler.js
  │   │   ├── authenticate.js
  │   │   ├── authorize.js
  │   │   ├── errorHandler.js
  │   │   └── validate.js
  │   ├── routes            # Express routers (define endpoints, connect to controllers)
  │   │   ├── auth.js
  │   │   ├── exercises.js
  │   │   ├── muscleGroups.js
  │   │   ├── users.js
  │   │   ├── workoutSessions.js
  │   │   └── workoutTemplates.js
  │   ├── server.js         # Application entry point that boots the Express app
  │   └── validators        # Request validation schemas and logic
  │       ├── auth.js
  │       ├── common.js
  │       ├── exercises.js
  │       ├── muscleGroups.js
  │       ├── users.js
  │       ├── workoutSessions.js
  │       └── workoutTemplates.js
  ├── tests
  │   ├── helpers           # Utility functions for tests
  │   │   └── jwt.js
  │   └── integration       # Integration tests (Jest + Supertest)
  │       ├── auth.test.js
  │       ├── exercises.test.js
  │       ├── muscleGroups.test.js
  │       ├── users.test.js
  │       ├── workoutSessions.test.js
  │       └── workoutTemplates.test.js
  └── TODO.md               # Project task list / roadmap
```

---

## API Routes

### Auth

- `POST /auth/login` — Authenticate credentials and generate tokens
- `POST /auth/logout` — Invalidate refresh token
- `POST /auth/refresh-token` — Refresh access token

### Users

- `POST /users` - Create a new user
- `GET /users/:userId` - Get user details by ID
- `PATCH /users/:userId` - Update user details by ID
- `DELETE /users/:userId` - Remove a user

### Exercises

- `GET /exercises` — List all exercises for client user
- `POST /exercises` — Create a new exercise for client user
- `GET /exercises/:exerciseId` — Get an exercise's data by ID
- `PATCH /exercises/:exerciseId` — Update exercise
- `DELETE /exercises/:exerciseId` — Delete exercise

### Muscle Groups

- `GET /muscle-groups` — List all muscle groups for client user
- `POST /muscle-groups` — Create a new muscle group for client user
- `GET /muscle-groups/:muscleGroupId` — Get an muscle group's data by ID
- `PATCH /muscle-groups/:muscleGroupId` — Update muscle group
- `DELETE /muscle-groups/:muscleGroupId` — Delete muscle group

### Workout Templates

- `GET /workout-templates` — List templates for client user
- `POST /workout-templates` — Create new template for client user
- `GET /workout-templates/:workoutTemplateId` — Get template details with nested exercises
- `PATCH /workout-templates/:workoutTemplateId` — Update template
- `DELETE /workout-templates/:workoutTemplateId` — Delete template

### Workout Sessions

- `GET /workout-sessions` — List workout sessions for client user
- `POST /workout-sessions` — Create new session for client user
- `GET /workout-sessions/:workoutSessionId` — Get session with nested exercises & sets
- `PATCH /workout-sessions/:workoutSessionId` — Update session
- `DELETE /workout-sessions/:workoutSessionId` — Delete session

### Health Check

- `GET /health` — Returns `200 OK` if API is running

---

## Database Schema

![Entity Relationship Diagram](entity-relationship-diagram.png)

---

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `PORT` — Port to run the API on
- `JWT_SECRET` — Secret key for signing access tokens
- `JWT_EXPIRES_IN_SEC` — Expiration time for access tokens
- `JWT_REFRESH_SECRET` — Secret key for signing refresh tokens
- `JWT_REFRESH_EXPIRES_IN_SEC` — Expiration time for refresh tokens
