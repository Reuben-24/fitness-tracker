-- Insert sample users
INSERT INTO users (first_name, last_name, email, password_hash, birth_date, height_cm, gender)
VALUES 
  ('Alice', 'Smith', 'alice@example.com', 'hashedpassword1', '1990-06-15', 165, 'female'),
  ('Bob', 'Johnson', 'bob@example.com', 'hashedpassword2', '1985-03-22', 180, 'male');

-- Insert sample muscle groups
INSERT INTO muscle_groups (name) VALUES
  ('Chest'),
  ('Back'),
  ('Legs'),
  ('Arms'),
  ('Shoulders'),
  ('Core');

-- Insert sample exercises
INSERT INTO exercises (name, description, equipment)
VALUES 
  ('Bench Press', 'Chest press using barbell or dumbbell.', 'Barbell'),
  ('Deadlift', 'Full body exercise targeting back and legs.', 'Barbell'),
  ('Squat', 'Leg strengthening exercise.', 'Barbell'),
  ('Bicep Curl', 'Isolates biceps.', 'Dumbbell'),
  ('Shoulder Press', 'Targets shoulder muscles.', 'Dumbbell'),
  ('Plank', 'Core stability exercise.', 'Bodyweight');

-- Link exercises to muscle groups
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id)
VALUES 
  (1, 1), -- Bench Press → Chest
  (2, 2), -- Deadlift → Back
  (3, 3), -- Squat → Legs
  (4, 4), -- Bicep Curl → Arms
  (5, 5), -- Shoulder Press → Shoulders
  (6, 6); -- Plank → Core

-- Insert workout templates
INSERT INTO workout_templates (user_id, name)
VALUES 
  (1, 'Push Day'),
  (2, 'Pull Day');

-- Insert template exercises
INSERT INTO template_exercises (workout_template_id, exercise_id, sets, reps, weight, position)
VALUES 
  (1, 1, 4, 8, 60.0, 1), -- Bench Press in Push Day
  (1, 5, 3, 10, 20.0, 2), -- Shoulder Press
  (2, 2, 4, 5, 100.0, 1), -- Deadlift in Pull Day
  (2, 4, 3, 12, 12.5, 2); -- Bicep Curl

-- Insert workout sessions
INSERT INTO workout_sessions (user_id, workout_template_id, started_at, finished_at)
VALUES 
  (1, 1, '2025-08-01 08:00:00', '2025-08-01 09:00:00'),
  (2, 2, '2025-08-02 18:30:00', '2025-08-02 19:20:00');

-- Insert session exercises
INSERT INTO session_exercises (workout_session_id, exercise_id, position)
VALUES 
  (1, 1, 1),
  (1, 5, 2),
  (2, 2, 1),
  (2, 4, 2);

-- Insert exercise sets
INSERT INTO exercise_sets (session_exercise_id, set_number, reps, weight, completed)
VALUES 
  -- Session 1: Bench Press
  (1, 1, 8, 60.0, TRUE),
  (1, 2, 8, 60.0, TRUE),
  (1, 3, 8, 60.0, TRUE),
  (1, 4, 6, 60.0, TRUE),

  -- Session 1: Shoulder Press
  (2, 1, 10, 20.0, TRUE),
  (2, 2, 10, 20.0, TRUE),
  (2, 3, 10, 20.0, TRUE),

  -- Session 2: Deadlift
  (3, 1, 5, 100.0, TRUE),
  (3, 2, 5, 100.0, TRUE),
  (3, 3, 5, 100.0, TRUE),
  (3, 4, 5, 100.0, TRUE),

  -- Session 2: Bicep Curl
  (4, 1, 12, 12.5, TRUE),
  (4, 2, 12, 12.5, TRUE),
  (4, 3, 12, 12.5, TRUE);

-- Insert body weights
INSERT INTO body_weights (user_id, weight_kg, recorded_at)
VALUES 
  (1, 68.5, '2025-08-01 07:30:00'),
  (2, 82.0, '2025-08-02 17:45:00');
