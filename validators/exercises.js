const { body } = require("express-validator");

exports.create = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name is required and must be 1–100 characters"),

  body("description")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),

  body("equipment")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Equipment must be less than 100 characters"),
];

exports.update = [
  body("name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be 1–100 characters if provided"),

  body("description")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters if provided"),

  body("equipment")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Equipment must be less than 100 characters if provided"),
];
