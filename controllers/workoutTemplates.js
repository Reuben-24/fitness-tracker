const prisma = require("../prisma/prisma");

exports.readAllForUser = async (req, res) => {
  const userId = req.user.id;
  const workoutTemplates = await prisma.WorkoutTemplate.findMany({
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
  });
  res.status(200).json({
    message: "Workout Templates successfully retrieved",
    workoutTemplates,
  });
};

exports.readForUserById = async (req, res) => {
  const userId = req.user.id;
  const workoutTemplateId = req.validated.params.workoutTemplateId;
  const workoutTemplate = await prisma.WorkoutTemplate.findFirst({
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
  const workoutTemplate = await prisma.WorkoutTemplate.create({
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
  // If client sends templateExercises: [], clear them all.
  // If client sends an array with items, replace with that set.

  const userId = req.user.id;
  const workoutTemplateId = req.validated.params.workoutTemplateId;
  const { templateExercises, ...fieldsToUpdate } = req.validated.body;

  // Check template exists and belongs to user
  const existingWorkoutTemplate = await prisma.WorkoutTemplate.findFirst({
    where: { id: workoutTemplateId, userId },
  });
  if (!existingWorkoutTemplate)
    return res.status(404).json({ error: "Workout Template not found" });

  // Begin transaction
  const updatedWorkoutTemplate = await prisma.$transaction(async (prisma) => {
    // If templateExercises is provided
    if (templateExercises !== undefined) {
      // Delete all existing template exercises
      await prisma.templateExercise.deleteMany({
        where: { workoutTemplateId },
      });

      // If the array has items, create new ones
      if (templateExercises.length > 0) {
        await prisma.templateExercise.createMany({
          data: templateExercises.map((te) => ({
            workoutTemplateId,
            exerciseId: te.exerciseId,
            sets: te.sets,
            reps: te.reps,
            weight: te.weight,
            position: te.position,
          })),
        });
      }
    }

    // Update workout template fields (name, etc.)
    return prisma.WorkoutTemplate.findUnique({
      where: { id: workoutTemplateId },
      include: {
        templateExercises: {
          include: { exercise: { include: { muscleGroups: true } } },
          orderBy: { position: "asc" },
        },
      },
    }).then((template) =>
      prisma.workoutTemplate.update({
        where: { id: workoutTemplateId },
        data: fieldsToUpdate,
        include: {
          templateExercises: {
            include: { exercise: { include: { muscleGroups: true } } },
            orderBy: { position: "asc" },
          },
        },
      }),
    );
  });

  res.status(200).json({
    message: "Workout Template successfully updated",
    workoutTemplate: updatedWorkoutTemplate,
  });
};

exports.delete = async (req, res) => {
  const userId = req.user.id;
  const workoutTemplateId = req.validated.params.workoutTemplateId;
  const workoutTemplate = await prisma.WorkoutTemplate.findFirst({
    where: { id: workoutTemplateId, userId },
  });
  if (!workoutTemplate)
    return res.status(404).json({ error: "Workout Template not found" });
  await prisma.WorkoutTemplate.delete({ where: { id: workoutTemplateId } });
  res.status(200).json({
    message: "Workout Template successfully deleted",
    workoutTemplate,
  });
};
