const user = require("../models/User.js");
const bcrypt = require("bcrypt");

exports.create = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    birthDate,
    heighCm,
    gender,
  } = req.validated.body;

  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);
  const data = {
    first_name: firstName,
    last_name: lastName,
    email,
    password_hash,
    birth_date: birthDate,
    height_cm: heighCm,
    gender,
  };

  const newUser = await user.create(data);

  res.status(201).json({
    message: "User successfully created",
    user: newUser,
  });
};

exports.read = async (req, res) => {
  const userId = req.user.id;
  const existingUser = await user.getById(userId);

  if (!existingUser) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  res.status(200).json({
    message: "User successfully retrieved",
    user: existingUser,
  });
};

exports.update = async (req, res) => {
  const userId = req.user.id;
  let fieldsToUpdate = { ...req.validated.body };

  // Handle password update: hash it if present
  if (fieldsToUpdate.password) {
    const saltRounds = 10;
    fieldsToUpdate.password_hash = await bcrypt.hash(
      fieldsToUpdate.password,
      saltRounds,
    );
    delete fieldsToUpdate.password; // remove plain password
  }

  const updatedUser = await user.update(userId, fieldsToUpdate);

  if (!updatedUser) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  res.status(200).json({
    message: "User successfully updated",
    user: updatedUser,
  });
};

exports.delete = async (req, res) => {
  const userId = req.user.id
  
  const deletedUser = await user.delete(userId);

  if (!deletedUser) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  res.status(200).json({
    message: "User successfully deleted",
    user: deletedUser,
  });
};
