const { body } = require("express-validator");
const validate = require("../middleware/validate");

exports.login = validate([
  body("email").trim().isEmail().normalizeEmail(),
  body("password").isString()
]);