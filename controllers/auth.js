const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const refreshToken = require("../models/RefreshToken");

exports.login = async (req, res) => {
  // TODO add input validation/sanitisation/rehydration/etc.

  const { email, password } = req.body;

  // Get user by email
  const existingUser = await user.getByEmail(email);
  if (!existingUser)
    return res.status(401).json({ error: "Invalid credentials" });

  // Compare password
  const isValid = await bcrypt.compare(password, existingUser.password_hash);
  if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

  // Sign JWT
  const token = jwt.sign({ userId: existingUser.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Refresh token
  const newRefreshToken = jwt.sign(
    { userId: existingUser.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
  );

  res.json({ token, newRefreshToken });
};

exports.logout = async (req, res) => {
  const { refreshToken: existingRefreshToken } = req.body;
  if (!existingRefreshToken)
    return res.status(400).json({ error: "Missing refresh token" });

  let payload;
  try {
    payload = jwt.verify(existingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Get all stored refresh tokens for this user
  const storedTokens = await refreshToken.getAllByUserId(payload.userId);

  // Find the token hash that matches
  let tokenToDelete = null;
  for (const t of storedTokens) {
    if (await bcrypt.compare(existingRefreshToken, t.token_hash)) {
      tokenToDelete = t.token_hash;
      break;
    }
  }

  if (!tokenToDelete) return res.status(401).json({ error: "Token not found" });

  // Delete the matching token
  await refreshToken.delete(tokenToDelete);

  res.json({ message: "Logged out successfully" });
};

exports.refreshToken = async (req, res) => {
  const { existingRefreshToken } = req.body;
  if (!existingRefreshToken)
    return res.status(401).json({ error: "Missing token" });

  const payload = jwt.verify(
    existingRefreshToken,
    process.env.JWT_REFRESH_SECRET,
  );

  // Get all stored refresh tokens for this user
  const storedTokens = await refreshToken.getAllByUserId(payload.userId);
  if (!storedTokens || storedTokens.length === 0)
    return res.status(401).json({ error: "Token not found" });

  // Compare incoming token to each hashed token
  let match = false;
  for (const t of storedTokens) {
    if (await bcrypt.compare(existingRefreshToken, t.token_hash)) {
      match = true;
      break;
    }
  }

  if (!match) return res.status(401).json({ error: "Invalid refresh token" });

  // Issue new access token
  const token = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Return the same refresh token for now
  res.json({ token, refreshToken: existingRefreshToken });
};
