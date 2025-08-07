-- In this SQL file, write (and comment!) the schema of your database, including the CREATE TABLE, CREATE INDEX, CREATE VIEW, etc. statements that compose it
-- Create tables: excercises, workouts, workout_logs, excercise_logs, body_weights
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_gender AS ENUM ('male', 'female', 'non-binary', 'prefer not to say');

CREATE TABLE users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  birth_date DATE NOT NULL,
  height_cm INTEGER,
  gender user_gender NOT NULL DEFAULT 'prefer not to say'
);

CREATE TABLE exercises (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  equipment VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE muscle_groups (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercise_muscle_groups (
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_group_id INTEGER NOT NULL REFERENCES muscle_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (exercise_id, muscle_group_id)
);

CREATE TABLE workout_templates (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE template_exercises (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  workout_template_id INTEGER REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL CHECK (sets > 0),
  reps INTEGER NOT NULL CHECK (reps > 0),
  target_weight NUMERIC(5,2),
  position INTEGER NOT NULL CHECK (position > 0)
);

CREATE TABLE workout_sessions (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  workout_template_id INTEGER REFERENCES workout_templates(id),
  performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  notes TEXT
);

CREATE TABLE session_exercises (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  workout_session_id INTEGER REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0)
);

CREATE TABLE exercise_sets (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  session_exercise_id INTEGER REFERENCES session_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL CHECK (set_number > 0),
  reps INTEGER CHECK (reps >= 0),
  weight NUMERIC(5,2) CHECK (weight >= 0),
  completed BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_exercises_updated_at
BEFORE UPDATE ON exercises
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_muscle_groups_updated_at
BEFORE UPDATE ON muscle_groups
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_workout_templates_updated_at
BEFORE UPDATE ON workout_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();