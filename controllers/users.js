const bcrypt = require("bcrypt");
const prisma = require("../prisma/prisma");

exports.read = async (req, res) => {
  const userId = req.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  res.status(200).json({
    message: "User successfully retrieved",
    user,
  });
};

exports.create = async (req, res) => {
  const { firstName, lastName, email, password, birthDate, heightCm, gender } =
    req.validated.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  try {
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        birthDate,
        heightCm,
        gender,
      },
    });
    res.status(201).json({
      message: "User successfully created",
      user,
    });
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ error: "Email already in use" });
    throw err;
  }
};

exports.update = async (req, res) => {
  const userId = req.user.id;
  let fieldsToUpdate = { ...req.validated.body };

  // Handle password update: hash it if present
  if (fieldsToUpdate.password) {
    const saltRounds = 10;
    fieldsToUpdate.passwordHash = await bcrypt.hash(
      fieldsToUpdate.password,
      saltRounds,
    );
    delete fieldsToUpdate.password; // remove plain password
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: fieldsToUpdate,
    });

    res.status(200).json({
      message: "User successfully updated",
      user,
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    throw err;
  }
};

exports.delete = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.delete({ where: { id: userId } });
    res.status(200).json({ message: "User deleted successfully", user });
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "User not found" });
    throw err;
  }
};
