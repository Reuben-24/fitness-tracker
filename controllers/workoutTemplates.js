const prisma = require("../prisma/prisma");

exports.readAllForUser = async (req, res) => {
  const userId = req.user.id;
  const muscleGroups = await prisma.WorkoutTemplate.findMany({
    where: { userId },
    include: { exercises: true },
  });
  res.status(200).json({
    message: "Workout Templates successfully retrieved",
    workoutTemplates,
  });
};

exports.readForUserById = async (req, res) => {
  const userId = req.user.id;
  const workoutTemplateId = req.validated.params.workoutTemplateId;

  
  const existingWorkoutTemplate = await workoutTemplate.getByIdWithExercises(templateId);

  if (
    !existingWorkoutTemplate ||
    existingWorkoutTemplate.user_id !== Number(userId)
  ) {
    return res.status(404).json({ error: "Workout Template not found" });
  }

  res.status(200).json({
    message: "Workout Template successfully retrieved",
    workoutTemplate: existingWorkoutTemplate,
  });
};

exports.create = async (req, res) => {
  const userId = req.user.id;
  const { name, exercises = [] } = req.body;

  const newWorkoutTemplate = await workoutTemplate.createWithExercises(
    userId,
    name,
    exercises,
  );

  res.status(201).json({
    message: "Workout Template successfully created",
    workoutTemplate: newWorkoutTemplate,
  });
};

exports.update = async (req, res) => {
  const userId = req.user.id;
  const workoutTemplateId = req.validated.params.workoutTemplateId;
  
  const { exercises = [], ...fieldsToUpdate } = req.body;

  const updatedWorkoutTemplate = await workoutTemplate.updateWithExercises(
    templateId,
    userId,
    fieldsToUpdate,
    exercises,
  );

  res.status(200).json({
    message: "Workout Template successfully updated",
    workoutTemplate: updatedWorkoutTemplate,
  });
};

exports.delete = async (req, res) => {
  const userId = req.user.id;
  const workoutTemplateId = req.validated.params.workoutTemplateId;

  const deletedWorkoutTemplate = await workoutTemplate.delete(
    templateId,
    userId,
  );

  res.status(200).json({
    message: "Workout Template successfully deleted",
    workoutTemplate: deletedWorkoutTemplate,
  });
};
