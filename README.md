# Fitness Tracker REST API

## Overview

A fitness tracker REST API, allowing users to log workouts, manage exercises, track progress, and create reusable workout templates.

---

## Table of Contents


---

## Architecture

### Back-End Framework
- Built with **JavaScript** and **Express.js**
- Uses Express's middleware and routing functionality for modular routes/middleware/error-handling

### Data Management
- **PostgreSQL:** Database Management System
- **Prisma:** Database configuration and Schema management 
- **Prisma CLient:** Object-Relational Mapping

### Authentication
- **JSON Web Tokens:** 
  - Short-lived access tokens for secure request authentication
  - Longer-lived, hashed reresh tokens temporarily stored in databse for secure persistent login
- **Bcrypt:** Password and refresh-token hashing

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
- **Prettier:** Code formatting

---

## Project Structure

```text
  .
  ├── .env
  ├── .gitignore
  ├── app.js
  ├── controllers
  │   ├── auth.js
  │   ├── exercises.js
  │   ├── muscleGroups.js
  │   ├── users.js
  │   ├── workoutSessions.js
  │   └── workoutTemplates.js
  ├── middleware
  │   ├── asyncErrorHandler.js
  │   ├── authenticate.js
  │   ├── authorize.js
  │   ├── errorHandler.js
  │   └── validate.js
  ├── package-lock.json
  ├── package.json
  ├── prisma
  │   ├── prisma.js
  │   └── schema.prisma
  ├── README.md
  ├── routes
  │   ├── auth.js
  │   ├── exercises.js
  │   ├── muscleGroups.js
  │   ├── users.js
  │   ├── workoutSessions.js
  │   └── workoutTemplates.js
  ├── server.js
  ├── tests
  │   ├── helpers
  │   │   └── jwt.js
  │   └── integration
  │       ├── auth.test.js
  │       ├── exercises.test.js
  │       ├── muscleGroups.test.js
  │       ├── users.test.js
  │       ├── workoutSessions.test.js
  │       └── workoutTemplates.test.js
  ├── TODO.md
  └── validators
      ├── auth.js
      ├── common.js
      ├── exercises.js
      ├── muscleGroups.js
      ├── users.js
      ├── workoutSessions.js
      └── workoutTemplates.js
```

---

## API Routes

### Auth
- `POST /auth/register` — Create a new user
- `POST /auth/login` — Authenticate & receive tokens
- `POST /auth/refresh` — Refresh access token
- `POST /auth/logout` — Invalidate refresh token
- `GET /me` — Get current user profile

### Exercises
- `GET /exercises` — List exercises (supports filtering/pagination)
- `POST /exercises` — Create a new exercise
- `GET /exercises/:id` — Get an exercise by ID
- `PATCH /exercises/:id` — Update exercise
- `DELETE /exercises/:id` — Delete exercise

### Workout Templates
- `GET /templates` — List templates
- `POST /templates` — Create new template
- `GET /templates/:id` — Get template details
- `PATCH /templates/:id` — Update template
- `DELETE /templates/:id` — Delete template

### Workout Sessions
- `GET /sessions` — List workout sessions
- `POST /sessions` — Create new session
- `GET /sessions/:id` — Get session with nested exercises & sets
- `PATCH /sessions/:id` — Update session
- `DELETE /sessions/:id` — Delete session
- `POST /sessions/:id/complete` — Mark session as finished

### Misc
- `GET /health` — Health check
- (Optional) `GET /metrics` — Aggregated stats (volume, PRs, etc.)

---

## Database Schema

---