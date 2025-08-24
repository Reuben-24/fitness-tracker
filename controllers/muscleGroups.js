const muscleGroup = require("../models/MuscleGroup");

exports.create = async (req, res) => {
  // TO DO ADD INPUT VALIDATION
  const userId = req.params.userId;
  const { name } = req.body;
  const data = { user_id: userId, name };
  const newMuscleGroup = await muscleGroup.create(data);
  res.status(201).json({
    message: "Muscle Group successfully created",
    muscleGroup: newMuscleGroup,
  });
};

exports.readAllForUser = async (req, res) => {
  const userId = req.params.userId;
  const muscleGroups = await muscleGroup.getAllByUserId(userId);

  res.status(200).json({
    message: "Muscle Groups successfully retrieved",
    muscleGroups, // will be [] if no exercises
  });
};

exports.readForUserById = async (req, res) => {
  const { userId, muscleGroupId } = req.params;
  const existingMuscleGroup = await muscleGroup.getById(muscleGroupId);

  if (!existingMuscleGroup || existingMuscleGroup.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Muscle Group not found" });
  }

  res.status(200).json({
    message: "Muscle Group successfully retrieved",
    muscleGroup: existingMuscleGroup,
  });
};

exports.update = async (req, res) => {
  // TODO: ADD INPUT VALIDATION
  const { userId, muscleGroupId } = req.params;
  const fieldsToUpdate = { ...req.body };

  const existingMuscleGroup = await muscleGroup.getById(muscleGroupId);

  if (!existingMuscleGroup || existingMuscleGroup.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Muscle Group not found" });
  }

  const updatedMuscleGroup = await muscleGroup.update(
    muscleGroupId,
    fieldsToUpdate,
  );

  res.status(200).json({
    message: "Muscle Group successfully updated",
    muscleGroup: updatedMuscleGroup,
  });
};

exports.delete = async (req, res) => {
  const { userId, muscleGroupId } = req.params;

  const existingMuscleGroup = await muscleGroup.getById(muscleGroupId);
  if (!existingMuscleGroup || existingMuscleGroup.user_id !== Number(userId)) {
    return res.status(404).json({ error: "Muscle Group not found" });
  }

  const deletedMuscleGroup = await muscleGroup.delete(muscleGroupId);

  res.status(200).json({
    message: "Muscle Group successfully deleted",
    muscleGroup: deletedMuscleGroup,
  });
};
