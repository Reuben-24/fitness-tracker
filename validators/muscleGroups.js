const { body } = require("express-validator");

exports.create = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name is required and must be 1–100 characters"),
];

exports.update = [
  body("name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be 1–100 characters if provided"),
];