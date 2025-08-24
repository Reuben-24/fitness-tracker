const workoutSession = require("../models/WorkoutSession");

exports.create = async (req, res) => {
  // TODO: ADD INPUT VALIDATION
  const userId = req.params.userId;
  const { workoutTemplateId, startedAt, finishedAt, exercises } = req.body;

  const sessionData = {
    user_id: userId,
    workout_template_id: workoutTemplateId,
    started_at: startedAt,
    finished_at: finishedAt,
    exercises: exercises.map((ex) => ({
      exercise_id: ex.exerciseId,
      position: ex.position,
      sets: Array.isArray(ex.sets)
        ? ex.sets.map((s) => ({
            set_number: s.setNumber,
            reps: s.reps,
            weight: s.weight,
            completed: s.completed || false,
          }))
        : [],
    })),
  };

  await workoutSession.createSessionWithDetails(sessionData);

  res.status(201).json({
    message: "Workout Session successfully created",
  });
};

exports.readAllForUser = async (req, res) => {
  const userId = req.params.userId;
  const workoutSessions = await workoutSession.getAllByUserId(userId);

  res.status(200).json({
    message: "Workout Sessions successfully retrieved",
    workoutSessions, // will be [] if no exercises
  });
};

exports.readForUserById = async (req, res) => {
  const { userId, sessionId } = req.params;
  const existingWorkoutSession = await workoutSession.getAllDetails(sessionId);

  if (
    !existingWorkoutSession ||
    existingWorkoutSession.user_id !== Number(userId)
  ) {
    return res.status(404).json({ error: "Workout Session not found" });
  }

  res.status(200).json({
    message: "Workout Session successfully retrieved",
    workoutSession: existingWorkoutSession,
  });
};

exports.update = async (req, res) => {
  // TODO: ADD INPUT VALIDATION
  const { userId, sessionId } = req.params;
  const { workoutTemplateId, startedAt, finishedAt, exercises } = req.body;

  const existingSession = await workoutSession.getById(sessionId);
  if (!existingSession || existingSession.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Workout Session not found" });
  }

  const sessionData = {
    user_id: userId,
    workout_template_id: workoutTemplateId,
    started_at: startedAt,
    finished_at: finishedAt,
    exercises: exercises.map((ex) => ({
      exercise_id: ex.exerciseId,
      position: ex.position,
      sets: Array.isArray(ex.sets)
        ? ex.sets.map((s) => ({
            set_number: s.setNumber,
            reps: s.reps,
            weight: s.weight,
            completed: s.completed || false,
          }))
        : [],
    })),
  };

  await workoutSession.updateSessionWithDetails(sessionId, sessionData);

  res.status(200).json({
    message: "Workout Session successfully updated",
  });
};

exports.delete = async (req, res) => {
  const { userId, sessionId } = req.params;

  const existingWorkoutSession = await workoutSession.getById(sessionId);
  if (
    !existingWorkoutSession ||
    existingWorkoutSession.user_id !== Number(userId)
  ) {
    return res.status(404).json({ error: "Workout Session not found" });
  }

  const deletedWorkoutSession = await workoutSession.delete(sessionId);

  res.status(200).json({
    message: "Workout Session successfully deleted",
    workoutSession: deletedWorkoutSession,
  });
};
