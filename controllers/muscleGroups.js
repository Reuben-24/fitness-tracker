const prisma = require("../prisma/prisma");

exports.readAllForUser = async (req, res) => {
  const userId = req.user.id;
  const muscleGroups = await prisma.MuscleGroup.findMany({
    where: { userId },
    include: { exercises: true },
  });
  res.status(200).json({
    message: "Muscle Groups successfully retrieved",
    muscleGroups,
  });
};

exports.readForUserById = async (req, res) => {
  const userId = req.user.id;
  const muscleGroupId = req.validated.params.muscleGroupId;
  const muscleGroup = await prisma.MuscleGroup.findFirst({
    where: { id: muscleGroupId, userId },
    include: { exercises: true },
  });
  if (!muscleGroup)
    return res.status(404).json({ error: "Muscle Group not found" });
  res.status(200).json({
    message: "Muscle Group successfully retrieved",
    muscleGroup,
  });
};

exports.create = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.validated.body;
  const muscleGroup = await prisma.MuscleGroup.create({
    data: { userId, name },
    include: { exercises: true },
  });
  res.status(201).json({
    message: "Muscle Group successfully created",
    muscleGroup,
  });
};

exports.update = async (req, res) => {
  const userId = req.user.id;
  const muscleGroupId = req.validated.params.muscleGroupId;
  const fieldsToUpdate = { ...req.validated.body };
  const existingMuscleGroup = await prisma.MuscleGroup.findFirst({
    where: { id: muscleGroupId, userId },
  });
  if (!existingMuscleGroup)
    return res.status(404).json({ error: "Muscle Group not found" });
  const updatedMuscleGroup = await prisma.MuscleGroup.update({
    where: { id: muscleGroupId },
    data: { ...fieldsToUpdate },
    include: { exercises: true },
  });
  res.status(200).json({
    message: "Muscle Group successfully updated",
    muscleGroup: updatedMuscleGroup,
  });
};

exports.delete = async (req, res) => {
  const userId = req.user.id;
  const { muscleGroupId } = req.validated.params;
  const muscleGroup = await prisma.MuscleGroup.findFirst({
    where: { id: muscleGroupId, userId },
  });
  if (!muscleGroup)
    return res.status(404).json({ error: "Muscle Group not found" });
  await prisma.MuscleGroup.delete({ where: { id: muscleGroup.id } });
  res.status(200).json({
    message: "Muscle Group successfully deleted",
    muscleGroup,
  });
};
