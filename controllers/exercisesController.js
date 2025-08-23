const exercise = require("../models/Exercise");
const muscleGroup = require("../models/MuscleGroup");

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

  const updatedExercise = await exercise.update(exerciseId, fieldsToUpdate);

  if (!updatedExercise || updatedExercise.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  res.status(200).json({
    message: "Exercise successfully updated",
    exercise: updatedExercise,
  });
};

exports.delete = async (req, res) => {
  const { userId, exerciseId } = req.params;

  const existingExercise = await exercise.getById(exerciseId);
  if (!existingExercise || existingExercise.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  const deletedExercise = await exercise.delete(exerciseId);

  res.status(200).json({
    message: "Exercise successfully deleted",
    exercise: deletedExercise,
  });
};

exports.addMuscleGroup = async (req, res) => {
  const { userId, exerciseId, muscleGroupId } = req.params;

  // Check exercise belongs to user
  const existingExercise = await exercise.getById(exerciseId);
  if (!existingExercise || existingExercise.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  // Check muscle group belongs to user
  const existingMuscleGroup = await muscleGroup.getById(muscleGroupId);
  console.log(existingMuscleGroup)
  if (!existingMuscleGroup || existingMuscleGroup.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Muscle group not found" });
  }

  await exercise.addMuscleGroupsToExercise(exerciseId, [muscleGroupId]);

  res.status(200).json({
    message: "Muscle Group successfully added",
  });
};

exports.removeMuscleGroup = async (req, res) => {
  const { userId, exerciseId, muscleGroupId } = req.params;

  // Check exercise belongs to user
  const existingExercise = await exercise.getById(exerciseId);
  if (!existingExercise || existingExercise.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  // Check muscle group belongs to user
  const existingMuscleGroup = await muscleGroup.getById(muscleGroupId);
  if (!existingMuscleGroup || existingMuscleGroup.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Muscle group not found" });
  }

  // Try removing the link
  const result = await exercise.removeMuscleGroup(exerciseId, muscleGroupId);

  // Optional: check if a row was actually deleted
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Relationship not found" });
  }

  res.status(200).json({
    message: "Muscle Group successfully removed from exercise",
  });
};

exports.readMuscleGroups = async (req, res) => {
  const { userId, exerciseId } = req.params;

  // Ensure exercise belongs to user
  const existingExercise = await exercise.getById(exerciseId);
  if (!existingExercise || existingExercise.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  const muscleGroups = await exercise.getMuscleGroupsForExercise(exerciseId);

  res.status(200).json({
    message: "Muscle Groups successfully retrieved",
    muscleGroups, // will be [] if no muscle groups
  });
};
