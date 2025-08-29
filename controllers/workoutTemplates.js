const prisma = require("../prisma/prisma");

exports.readAllForUser = async (req, res) => {
  const userId = req.user.id;
  const workoutTemplates = await prisma.workoutTemplate.findMany({
    where: { userId },
    include: {
      templateExercises: {
        include: {
          exercise: {
            include: { muscleGroups: true },
          },
        },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
  res.status(200).json({
    message: "Workout Templates successfully retrieved",
    workoutTemplates, // will be [] if no exercises
  });
};

exports.readForUserById = async (req, res) => {
  const userId = req.user.id;
  const workoutTemplateId = req.validated.params.workoutTemplateId;
  const workoutTemplate = await prisma.workoutTemplate.findFirst({
    where: { id: workoutTemplateId, userId },
    include: {
      templateExercises: {
        include: {
          exercise: {
            include: { muscleGroups: true },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });
  if (!workoutTemplate)
    return res.status(404).json({ error: "Workout Template not found" });
  res.status(200).json({
    message: "Workout Template successfully retrieved",
    workoutTemplate,
  });
};

exports.create = async (req, res) => {
  const userId = req.user.id;
  const { name, templateExercises } = req.validated.body;
  const workoutTemplate = await prisma.workoutTemplate.create({
    data: {
      userId,
      name,
      templateExercises: {
        create: templateExercises.map((te) => ({
          exerciseId: te.exerciseId,
          sets: te.sets,
          reps: te.reps,
          weight: te.weight,
          position: te.position,
        })),
      },
    },
    include: {
      templateExercises: {
        include: {
          exercise: {
            include: { muscleGroups: true },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });
  res.status(201).json({
    message: "Workout Template successfully created",
    workoutTemplate,
  });
};

exports.update = async (req, res) => {
  // If client omits templateExercises, leave them unchanged
  // If client sends templateExercises: [], clear the existing values
  // If client sends an array with items, replace with given values

  const userId = req.user.id;
  const workoutTemplateId = req.validated.params.workoutTemplateId;
  const { templateExercises, ...fieldsToUpdate } = req.validated.body;

  // Check template exists and belongs to user
  const existingWorkoutTemplate = await prisma.workoutTemplate.findFirst({
    where: { id: workoutTemplateId, userId },
  });
  if (!existingWorkoutTemplate)
    return res.status(404).json({ error: "Workout Template not found" });

  // Perform the update
  const updatedWorkoutTemplate = await prisma.workoutTemplate.update({
    where: { id: workoutTemplateId },
    data: {
      ...fieldsToUpdate,
      templateExercises:
        templateExercises === undefined
          ? undefined // leave unchanged
          : {
              deleteMany: {}, // clear all
              createMany: {
                data: templateExercises.map((te) => ({
                  exerciseId: te.exerciseId,
                  sets: te.sets,
                  reps: te.reps,
                  weight: te.weight,
                  position: te.position,
                })),
              },
            },
    },
    include: {
      templateExercises: {
        include: { exercise: { include: { muscleGroups: true } } },
        orderBy: { position: "asc" },
      },
    },
  });

  res.status(200).json({
    message: "Workout Template successfully updated",
    workoutTemplate: updatedWorkoutTemplate,
  });
};

exports.delete = async (req, res) => {
  const userId = req.user.id;
  const workoutTemplateId = req.validated.params.workoutTemplateId;
  const workoutTemplate = await prisma.workoutTemplate.findFirst({
    where: { id: workoutTemplateId, userId },
  });
  if (!workoutTemplate)
    return res.status(404).json({ error: "Workout Template not found" });
  await prisma.workoutTemplate.delete({ where: { id: workoutTemplateId } });
  res.status(200).json({
    message: "Workout Template successfully deleted",
    workoutTemplate,
  });
};
