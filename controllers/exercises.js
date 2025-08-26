const prisma = require("../prisma/prisma");

exports.create = async (req, res) => {
  const userId = req.user.id;
  const fieldsToCreate = req.validated.body;
  const exercise = await prisma.Exercise.create({
    data: { userId, ...fieldsToCreate },
  });
  res.status(201).json({
    message: "Exercise successfully created",
    exercise,
  });
};

exports.readAllForUser = async (req, res) => {
  const userId = req.user.id;
  const exercises = await prisma.Exercise.findMany({ where: { userId } });
  res.status(200).json({
    message: "Exercises successfully retrieved",
    exercises,
  });
};

exports.readForUserById = async (req, res) => {
  const userId = req.user.id;
  const exerciseId = req.validated.params.exerciseId;
  const exercise = await prisma.Exercise.findFirst({
    where: { id: exerciseId, userId },
  });
  if (!exercise) return res.status(404).json({ error: "Exercise not found" });
  res
    .status(200)
    .json({ message: "Exercise successfully retrieved", exercise });
};

exports.update = async (req, res) => {
  const userId = req.user.id;
  const { exerciseId } = req.validated.params;
  const fieldsToUpdate = { ...req.validated.body };
  const result = await prisma.Exercise.updateMany({
    where: { id: exerciseId, userId },
    data: { ...fieldsToUpdate },
  });
  if (result.count === 0) {
    return res.status(404).json({ error: "Exercise not found" });
  }
  const exercise = await prisma.Exercise.findUnique({
    where: { id: exerciseId },
  });
  res.status(200).json({
    message: "Exercise successfully updated",
    exercise,
  });
};

exports.delete = async (req, res) => {
  const userId = req.user.id;
  const { exerciseId } = req.validated.params;
  const exercise = await prisma.Exercise.findFirst({
    where: { id: exerciseId, userId },
  });
  if (!exercise) return res.status(404).json({ error: "Exercise not found" });
  await prisma.Exercise.delete({ where: { id: exercise.id } });
  res.status(200).json({
    message: "Exercise successfully deleted",
    exercise,
  });
};

exports.addMuscleGroup = async (req, res) => {
  const userId = req.user.id;
  const { exerciseId, muscleGroupId } = req.validated.params;



  // Check exercise belongs to user
  const existingExercise = await exercise.getById(exerciseId);
  if (!existingExercise || existingExercise.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  // Check muscle group belongs to user
  const existingMuscleGroup = await muscleGroup.getById(muscleGroupId);
  console.log(existingMuscleGroup);
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
