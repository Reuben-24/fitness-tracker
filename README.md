# Fitness Tracker Database

This project defines the schema and data interaction layer for a fitness tracking application. It is focused on modeling core functionality such as workouts, exercises, progress tracking, and user data through a well-structured PostgreSQL database.

## Overview

- **PostgreSQL** is used as the relational database system.
- **schema.sql** defines the database schema, including tables, relationships, indexes, and triggers.
- **seed.sql** provides dummy data for development and testing.
- A dedicated `models/` directory contains JavaScript (or applicable language) modules to encapsulate and organize all database interactions for each entity.
- Designed with extensibility and query performance in mind using thoughtful constraints and indexing.

## Key Features

- Tracks **workout sessions**, **exercises**, **sets**, **templates**, and **user progress** (e.g., weight history).
- Supports user-defined **muscle groups** and **exercise templates**.
- **Triggers** keep `updated_at` fields in sync for auditability.
- **Composite primary keys** and **indexing** optimize performance for frequent queries (e.g., filtering session data, fetching latest body weight, sorting workouts).

## Usage

1. Run `schema.sql` to initialize the database schema.
2. Run `seed.sql` to populate the database with dummy data.
3. Use the models in the `models/` directory to perform CRUD operations.
