-- Indexes
-- For finding workouts by user
CREATE INDEX idx_workout_templates_user_id ON workout_templates(user_id);
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);

-- For looking up exercises in a template or session
CREATE INDEX idx_template_exercises_template_id ON template_exercises(workout_template_id);
CREATE INDEX idx_template_exercises_exercise_id ON template_exercises(exercise_id);
CREATE INDEX idx_session_exercises_session_id ON session_exercises(workout_session_id);
CREATE INDEX idx_session_exercises_exercise_id ON session_exercises(exercise_id);

-- For quickly retrieving sets within a session exercise
CREATE INDEX idx_exercise_sets_session_exercise_id ON exercise_sets(session_exercise_id);

-- For quickly retrieving body weight entries for a user
CREATE INDEX idx_body_weights_user_id_recorded_at ON body_weights(user_id, recorded_at DESC);

-- For filtering or joining muscle groups
CREATE INDEX idx_exercise_muscle_groups_exercise_id ON exercise_muscle_groups(exercise_id);
CREATE INDEX idx_exercise_muscle_groups_muscle_group_id ON exercise_muscle_groups(muscle_group_id);


-- Tables
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
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE template_exercises (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  workout_template_id INTEGER REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL CHECK (sets > 0),
  reps INTEGER NOT NULL CHECK (reps > 0),
  weight NUMERIC(5,2),
  position INTEGER NOT NULL CHECK (position > 0)
);
CREATE TABLE workout_sessions (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  workout_template_id INTEGER REFERENCES workout_templates(id),
  started_at TIMESTAMP,
  finished_at TIMESTAMP
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
CREATE TABLE body_weights (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0),
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Triggers
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