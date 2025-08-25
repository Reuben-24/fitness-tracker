const { body } = require("express-validator");

const allowedGenders = ["male", "female", "non-binary", "prefer not to say"];

exports.update = [
  body("firstName")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("First name must be 1–100 chars if provided"),

  body("lastName")
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

  body("birthDate")
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value > new Date()) {
        throw new Error("Birth date cannot be in the future");
      }
      return true;
    }),

  body("heightCm")
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
  body("firstName")
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("First name is required (1–100 chars)"),

  body("lastName")
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

  body("birthDate")
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value > new Date()) {
        throw new Error("Birth date cannot be in the future");
      }
      return true;
    }),

  body("heightCm")
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
