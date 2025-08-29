const prisma = require("../prisma/prisma");

exports.readAllForUser = async (req, res) => {
  const userId = req.user.id;
  const exercises = await prisma.exercise.findMany({
    where: { userId },
    include: { muscleGroups: true },
    orderBy: { name: 'asc' },
  });
  res.status(200).json({
    message: "Exercises successfully retrieved",
    exercises,
  });
};

exports.readForUserById = async (req, res) => {
  const userId = req.user.id;
  const exerciseId = req.validated.params.exerciseId;
  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId },
    include: { muscleGroups: true },
  });
  if (!exercise) return res.status(404).json({ error: "Exercise not found" });
  res
    .status(200)
    .json({ message: "Exercise successfully retrieved", exercise });
};

exports.create = async (req, res) => {
  const userId = req.user.id;
  const { muscleGroupIds, ...fieldsToCreate } = req.validated.body;
  const exercise = await prisma.exercise.create({
    data: {
      userId,
      ...fieldsToCreate,
      muscleGroups: muscleGroupIds
        ? {
            connect: muscleGroupIds.map((id) => ({ id })),
          }
        : undefined,
    },
    include: {
      muscleGroups: true,
    },
  });
  res.status(201).json({
    message: "Exercise successfully created",
    exercise,
  });
};

exports.update = async (req, res) => {
  // If muscleGroupIds is undefined muscle group links will be unchanged
  // If musceGroupIds = [] will remove all connected muscle groups
  // If muscleGroupIds contains an array of valid ids, the existing muscle groups
  // will be replaced by the new array
  const userId = req.user.id;
  const exerciseId = req.validated.params.exerciseId;
  const { muscleGroupIds, ...fieldsToUpdate } = req.validated.body;
  const existingExercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId },
  });
  if (!existingExercise)
    return res.status(404).json({ error: "Exercise not found" });
  const updatedExercise = await prisma.exercise.update({
    where: { id: exerciseId },
    data: {
      ...fieldsToUpdate,
      muscleGroups: muscleGroupIds
        ? {
            set: muscleGroupIds.map((id) => ({ id })),
          }
        : undefined,
    },
    include: { muscleGroups: true },
  });
  res.status(200).json({
    message: "Exercise successfully updated",
    exercise: updatedExercise,
  });
};

exports.delete = async (req, res) => {
  const userId = req.user.id;
  const { exerciseId } = req.validated.params;
  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId },
  });
  if (!exercise) return res.status(404).json({ error: "Exercise not found" });
  await prisma.exercise.delete({ where: { id: exercise.id } });
  res.status(200).json({
    message: "Exercise successfully deleted",
    exercise,
  });
};
