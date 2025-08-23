const exercise = require("../models/Exercise");

exports.create = async (req, res) => {
  // ADD INPUT VALIDATION
  const userId = req.params.userId;
  const { name, description, equipment } = req.body;
  const data = { user_id: userId, name, description, equipment };
  const newExercise = await exercise.create(data);
  res.status(201).json({
    message: "Exercise successfully created",
    exercise: newExercise,
  });
};

exports.readAllForUser = async (req, res) => {
  const userId = req.params.userId;
  const exercises = await exercise.getAllByUserId(userId);

  res.status(200).json({
    message: "Exercises successfully retrieved",
    exercises, // will be [] if no exercises
  });
};

exports.readForUserById = async (req, res) => {
  const { userId, exerciseId } = req.params;
  const existingExercise = await exercise.getById(exerciseId);

  if (!existingExercise || existingExercise.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  res.status(200).json({
    message: "Exercise successfully retrieved",
    exercise: existingExercise,
  });
};

exports.update = async (req, res) => {
  // TODO: ADD INPUT VALIDATION
  const { userId, exerciseId } = req.params;
  const fieldsToUpdate = { ...req.body };

  const updatedExercise = await exercise.update(exerciseId, fieldsToUpdate)

  if (!updatedExercise || updatedExercise.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  res.status(200).json({
    message: "Exercise successfully updated",
    exercise: updatedExercise,
  });
}

exports.delete = async (req, res) => {
  const { userId, exerciseId } = req.params;

  const existingExercise = await exercise.getById(exerciseId);
  if (!existingExercise || existingExercise.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  const deletedExercise = await exercise.delete(exerciseId);

  res.status(200).json({
    message: "Exercise successfully deleted",
    exercise: deletedExercise
  })
}
