const jwt = require("jsonwebtoken");

function generateTestJWT(userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || "test_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN_SEC || "1h",
  });
  return token;
}

module.exports = generateTestJWT;
