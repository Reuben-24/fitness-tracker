const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../../prisma/prisma");

function generateTestJWT(userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || "test_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN_SEC || 3600,
  });
  return token;
}

async function createTestRefreshJWT(userId) {
  // Sign refresh token
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || "test_secret",
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN_SEC || 3600 },
  );

  const expiresInSec = parseInt(process.env.JWT_REFRESH_EXPIRES_IN_SEC || 3600);
  const expiresAt = new Date(Date.now() + expiresInSec * 1000);

  const saltRounds = 10;
  const tokenHash = await bcrypt.hash(refreshToken, saltRounds);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: tokenHash,
      expiresAt: expiresAt,
    },
  });
  return refreshToken;
}

module.exports = { createTestRefreshJWT, generateTestJWT };
