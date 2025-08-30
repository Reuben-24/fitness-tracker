# Fitness Tracker REST API

## Overview

A fitness tracker REST API, allowing users to log workouts, manage exercises, track progress, and create reusable workout templates.

---

## Table of Contents


---

## Architecture

### **Framework:** Express.js

- **Framework:** Express.js (modular routes/controllers/middlewares/validators)
- **Database/ORM** Prisma (PostgreSQL)
- **Authentication** JWT (access & refresh), bcrypt for password hashing
- **Validation:** zod / express-validator (choose one)
- **Docs:** OpenAPI/Swagger (served at `/docs`)
- **Testing:** Jest + Supertest
- **Misc:** Helmet, CORS, rate limiting, request logging

---

## Project Structure

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