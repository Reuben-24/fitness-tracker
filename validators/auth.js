const { body } = require("express-validator");

exports.login = [
  body("email").trim().isEmail().normalizeEmail(),
  body("password").isString()
];