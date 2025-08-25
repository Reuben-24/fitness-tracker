const { body } = require("express-validator");

exports.create = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name is required and must be 1–100 characters"),

  body("description")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),

  body("equipment")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Equipment must be less than 100 characters"),
];