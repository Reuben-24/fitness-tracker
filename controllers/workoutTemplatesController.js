const workoutTemplate = require("../models/WorkoutTemplate");

exports.create = async (req, res) => {
  // TODO ADD INPUT VALIDATION
  const userId = req.params.userId;
  const { name } = req.body;
  const data = { user_id: userId, name };
  const newWorkoutTemplate = await workoutTemplate.create(data);
  res.status(201).json({
    message: "Workout Template successfully created",
    workoutTemplate: newWorkoutTemplate,
  });
};

exports.readAllForUser = async (req, res) => {
  const userId = req.params.userId;
  const workoutTemplates = await workoutTemplate.getAllByUserId(userId);

  res.status(200).json({
    message: "Workout Templates successfully retrieved",
    workoutTemplates, // will be [] if no exercises
  });
};

exports.readForUserById = async (req, res) => {
  const { userId, templateId } = req.params;
  const existingWorkoutTemplate = await workoutTemplate.getById(templateId);

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

exports.update = async (req, res) => {
  // TODO: ADD INPUT VALIDATION
  const { userId, templateId } = req.params;
  const fieldsToUpdate = { ...req.body };

  const existingTemplate = await workoutTemplate.getById(templateId);

  if (!existingTemplate || existingTemplate.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Workout Template not found" });
  }

  const updatedWorkoutTemplate = await workoutTemplate.update(
    templateId,
    fieldsToUpdate,
  );

  res.status(200).json({
    message: "Workout Template successfully updated",
    workoutTemplate: updatedWorkoutTemplate,
  });
};

exports.delete = async (req, res) => {
  const { userId, templateId } = req.params;

  const existingWorkoutTemplate = await workoutTemplate.getById(templateId);
  if (
    !existingWorkoutTemplate ||
    existingWorkoutTemplate.user_id !== Number(userId)
  ) {
    return res.status(404).json({ error: "Workout Template not found" });
  }

  const deletedWorkoutTemplate = await workoutTemplate.delete(templateId);

  res.status(200).json({
    message: "Workout Template successfully deleted",
    workoutTemplate: deletedWorkoutTemplate,
  });
};
