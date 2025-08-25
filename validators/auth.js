const { body } = require("express-validator");

exports.login = [
  body("email").trim().isEmail().normalizeEmail(),
  body("password").isString(),
];

exports.logout = exports.refreshToken = [
  body("refreshToken")
    .exists().withMessage("Refresh token is required")
    .bail() // stop validation chain if missing
    .isString().withMessage("Refresh token must be a string")
    .notEmpty().withMessage("Refresh token cannot be empty"),
];