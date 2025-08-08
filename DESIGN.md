# Design Document
By Reuben Faltiska

Video overview: <URL HERE>

---

## Scope

* This project aims to layout the database and relavent database interactions for a resistance training tracker application.
* The database tracks users, exercises, muscle groups, workouts and body weights
* A few things which i've decided not to include within the scope of the database are: gyms, trainers, diets, goals and equipment

---

## Functional Requirements

* The essence of this database is that it enables uses to track their workouts. Users can create an account, set up the exercises and the corresponding muscle groups those exercises train and then create workout templates with those exercises and the details (sets, reps, etc.) they intend to perform. Users can then track their workouts (the actual results of the planned session). Users can also keep track of there body weight over time.

* Users should only be able to view and manage their own workouts, exercises, muscle groups, sessions, and body weights. No admin roles or user management beyond their own profile. Users cannot perform actions outside of personal fitness training such as managing gyms, trainers, diets, social interactions, or payments, which the database doesn’t model.

---

## Representation

### Entities

In this section you should answer the following questions:

* Which entities will you choose to represent in your database?
- **Users**: Represent the people who use the system.
- **Exercises**: The individual exercises users create.
- **Muscle Groups**: Categorize exercises by muscle group.
- **Exercise-Muscle Groups**: Many-to-many relation between exercises and muscle groups.
- **Workout Templates**: Predefined workout plans users create.
- **Template Exercises**: Exercises within a workout template, including sets, reps, weight, and order.
- **Workout Sessions**: Instances of a user performing a workout template.
- **Session Exercises**: Exercises performed during a workout session.
- **Exercise Sets**: Individual sets within a session exercise with reps, weight, and completion status.
- **Body Weights**: Users’ recorded body weights over time.

* What attributes will those entities have?
- **Users**: id, first_name, last_name, email, password_hash, birth_date, height_cm, gender, timestamps
- **Exercises**: id, user_id, name, description, equipment, timestamps
- **Muscle Groups**: id, user_id, name, timestamps
- **Exercise-Muscle Groups**: exercise_id, muscle_group_id (composite PK)
- **Workout Templates**: id, user_id, name, timestamps
- **Template Exercises**: id, workout_template_id, exercise_id, sets, reps, weight, position
- **Workout Sessions**: id, user_id, workout_template_id, started_at, finished_at
- **Session Exercises**: id, workout_session_id, exercise_id, position
- **Exercise Sets**: id, session_exercise_id, set_number, reps, weight, completed
- **Body Weights**: id, user_id, weight_kg, recorded_at

* Why did you choose the types you did?
- **INTEGER for IDs**: Efficient, auto-incremented primary keys for uniqueness and indexing.
- **VARCHAR for names and text fields**: To allow variable-length strings with reasonable limits (e.g., VARCHAR(100) for names).
- **TEXT for descriptions and hashes**: To allow longer or unbounded text (e.g., password hashes, exercise descriptions).
- **NUMERIC(5,2) for weights**: Precise decimal type suitable for weights and measurements, allowing two decimal places.
- **TIMESTAMP for dates and times**: To track creation, updates, and event times with timezone-awareness.
- **BOOLEAN for completed**: Clear true/false status for set completion.
- **ENUM for gender**: Restricts gender to predefined categories for data integrity.
- **CITEXT for emails**: Case-insensitive text for email addresses to prevent duplicates due to case variations.

* Why did you choose the constraints you did?
- **PRIMARY KEYs**: Ensure each record is uniquely identifiable.
- **FOREIGN KEYs with ON DELETE CASCADE**: Maintain referential integrity and automatically delete related child records when a parent is removed (e.g., deleting a user deletes their exercises).
- **UNIQUE constraints**: Prevent duplicate entries where necessary, such as unique exercise names per user.
- **NOT NULL constraints**: Ensure required fields are always provided.
- **CHECK constraints**: Enforce valid data ranges, such as positive reps, sets, weights, and valid birth dates.
- **Indexes on foreign keys and commonly filtered columns**: Improve query performance for operations like fetching exercises by user or sessions by user, or joining tables on IDs.
- **Composite primary key for exercise_muscle_groups**: Enforces uniqueness in many-to-many relationships without duplicate pairs.
- **Position uniqueness per workout_template_id in template_exercises**: Prevent duplicate ordering positions within a workout template.
- **Triggers to update `updated_at` timestamp on updates**: Automate timestamp maintenance to reflect record changes.

### Relationships

![Entity Relationship Diagram](entity-relationship-diagram.png)

---

## Optimizations

### Indexes

Indexes are used throughout the schema to optimize query performance, particularly for frequent joins, lookups, and filtering operations across foreign key relationships and time-based data.

#### Primary Keys
- **Every table includes a primary key** (`id`) which PostgreSQL automatically indexes. These indexes allow fast access to rows based on their unique identifier.

#### Composite Primary Key
- **`exercise_muscle_groups (exercise_id, muscle_group_id)`**: This composite key ensures that each exercise–muscle group pair is unique and supports fast lookups when filtering exercises by muscle group or vice versa.

#### User-based Foreign Key Indexes
These indexes were created manually to improve performance for queries that filter or join on `user_id`, which PostgreSQL does *not* index by default for foreign keys.

- `idx_workout_templates_user_id`: Speeds up retrieval of all workout templates for a user.
- `idx_workout_sessions_user_id`: Optimizes queries that retrieve a user's workout history.

#### Exercise Lookup in Templates and Sessions
These indexes are important for efficiently managing and retrieving exercises within both templates and sessions:

- `idx_template_exercises_template_id`: Fetch all exercises in a workout template.
- `idx_template_exercises_exercise_id`: Find all templates containing a specific exercise.
- `idx_session_exercises_session_id`: Retrieve all exercises in a workout session.
- `idx_session_exercises_exercise_id`: Quickly find session exercises by the base exercise.

#### Set Retrieval
- `idx_exercise_sets_session_exercise_id`: Allows fast retrieval of all sets associated with a session exercise — useful for rendering detailed workout data quickly.

#### Time-based and Historical Queries
- `idx_body_weights_user_id_recorded_at`: Composite index on `(user_id, recorded_at DESC)` speeds up fetching the most recent or historical weight entries for a user — ideal for tracking weight trends over time.

#### Muscle Group Filtering
These indexes support efficient filtering and joining between exercises and their associated muscle groups:

- `idx_exercise_muscle_groups_exercise_id`: Fetch all muscle groups associated with an exercise.
- `idx_exercise_muscle_groups_muscle_group_id`: Fetch all exercises that target a particular muscle group.

---

### Constraints
- **CHECK constraints**: Ensure only valid data is inserted (e.g., no negative sets, reps, or weight).
- **ENUMs**: Used for fields like `gender` to improve data consistency and validation.

### Cascading Deletes
- ON DELETE CASCADE used on many foreign keys (e.g., `session_exercises`, `exercise_sets`) to maintain data integrity and reduce the need for manual cleanup of orphaned records.

---

## Limitations

### General Design Limitations
- **No Support for Supersets / Circuits**: The schema assumes exercises are performed sequentially. Complex programming structures (e.g., supersets, EMOMs) aren't directly modeled.
- **No Media Support**: Exercises lack support for image or video attachments. Including visual references would require adding a media table or URL fields.
- **Lack of Progression Logic**: The template model is static; it doesn't dynamically adapt based on user performance or goals.

### Data Representation Limitations
- **Shared Exercises**: Exercises are tied to users; there's no concept of global/public/shared exercises unless duplicated across users.
- **Historical Template Changes**: Changing a workout template updates it for all future sessions, but doesn’t track the historical version of the template used during a specific session.
- **Equipment Modeling**: `equipment` is a plain string field. A more normalized design might extract this into a separate table for filtering/sorting.

### Scalability Considerations
- With a large number of sessions, sets, or exercises, performance might degrade without additional indexing or archiving strategies.
- There's no built-in full-text search or tagging system for exercises, which could improve discoverability in a larger dataset.
