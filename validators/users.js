const { body } = require("express-validator");

// Allowed gender values
const allowedGenders = ["male", "female", "non-binary", "prefer not to say"];

exports.update = [
  body("first_name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("First name must be 1–100 chars if provided"),

  body("last_name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Last name must be 1–100 chars if provided"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Must be a valid email if provided"),

  body("password")
    .optional()
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters if provided"),

  body("birth_date")
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value > new Date()) {
        throw new Error("Birth date cannot be in the future");
      }
      return true;
    }),

  body("height_cm")
    .optional()
    .isInt({ min: 1, max: 300 })
    .toInt()
    .withMessage("Height must be a positive integer if provided"),

  body("gender")
    .optional()
    .isString()
    .trim()
    .isIn(allowedGenders)
    .withMessage(`Gender must be one of: ${allowedGenders.join(", ")}`),
];

exports.create = [
  body("first_name")
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("First name is required (1–100 chars)"),

  body("last_name")
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Last name is required (1–100 chars)"),

  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Must be a valid email"),

  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("birth_date")
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value > new Date()) {
        throw new Error("Birth date cannot be in the future");
      }
      return true;
    }),

  body("height_cm")
    .isInt({ min: 1, max: 300 }) // enforce realistic range
    .toInt()
    .withMessage("Height must be a positive integer"),

  body("gender")
    .optional()
    .isString()
    .trim()
    .isIn(allowedGenders)
    .withMessage(`Gender must be one of: ${allowedGenders.join(", ")}`),
];
