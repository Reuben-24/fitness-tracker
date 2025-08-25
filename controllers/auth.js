const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../prisma/prisma");

exports.login = async (req, res) => {
  const { email, password } = req.validated.body;

  // Get user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  // Compare password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

  // Sign access token
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN_SEC,
  });

  // Sign refresh token
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN_SEC }
  );

  const expiresInSec = parseInt(process.env.JWT_REFRESH_EXPIRES_IN_SEC);
  const expiresAt = new Date(Date.now() + expiresInSec * 1000);

  const saltRounds = 10;
  const tokenHash = await bcrypt.hash(refreshToken, saltRounds);

  await prisma.refreshToken.create({
    data: {
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    },
  });

  res.json({ token, refreshToken });
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.validated.body;

  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  // Get all stored refresh tokens for this user
  const storedTokens = await prisma.refreshToken.findMany({where: { user_id: payload.userId }});

  // Find the token hash that matches
  let matchedToken = null;
  for (const t of storedTokens) {
    if (await bcrypt.compare(refreshToken, t.token_hash)) {
      matchedToken = t;
      break;
    }
  }

  if (!matchedToken) return res.status(401).json({ error: "Token not found" });

  // Delete the matching token
  await prisma.refreshToken.delete({ where: { id: matchedToken.id } });

  res.json({ message: "Logged out successfully" });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.validated.body;

  const payload = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  // Get all stored refresh tokens for this user
  const storedTokens = await prisma.refreshToken.findMany({where: { user_id: payload.userId }});

  // Find the token hash that matches
  let matchedToken = null;
  for (const t of storedTokens) {
    if (await bcrypt.compare(refreshToken, t.token_hash)) {
      matchedToken = t;
      break;
    }
  }

  if (!matchedToken) return res.status(401).json({ error: "Invalid refresh token" });

  // Issue new access token
  const token = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN_SEC,
  });

  // Return the same refresh token for now
  res.json({ token, refreshToken });
};