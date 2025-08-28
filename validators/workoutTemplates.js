const { body } = require("express-validator");

exports.create = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name is required and must be 1–100 characters"),

  body("templateExercises")
    .optional({ nullable: true })
    .isArray()
    .withMessage("templateExercises must be an array")
    .custom(
      (arr) =>
        arr.length === 0 ||
        arr.every((te) => te.exerciseId && te.sets && te.reps && te.position),
    )
    .withMessage(
      "Each templateExercise must have exerciseId, sets, reps, position",
    ),

  body("templateExercises.*.exerciseId")
    .isInt({ gt: 0 })
    .withMessage("Exercise ID must be a positive integer"),

  body("templateExercises.*.sets")
    .isInt({ gt: 0 })
    .withMessage("Sets must be a positive integer"),

  body("templateExercises.*.reps")
    .isInt({ gt: 0 })
    .withMessage("Reps must be a positive integer"),

  body("templateExercises.*.weight")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage(
      "Weight must be a valid decimal number with up to 2 decimal places",
    ),

  body("templateExercises.*.position")
    .isInt({ gt: 0 })
    .withMessage("Position must be a positive integer"),
];

exports.update = [
  body("name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be 1–100 characters if provided"),

  body("templateExercises")
    .optional({ nullable: true })
    .isArray()
    .withMessage("Template exercises must be an array if provided")
    .bail()
    .custom(
      (arr) =>
        arr.length === 0 ||
        arr.every((te) => te.exerciseId && te.sets && te.reps && te.position),
    )
    .withMessage(
      "Each templateExercise must have exerciseId, sets, reps, position if provided",
    ),

  body("templateExercises.*.exerciseId")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Exercise ID must be a positive integer if provided"),

  body("templateExercises.*.sets")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Sets must be a positive integer if provided"),

  body("templateExercises.*.reps")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Reps must be a positive integer if provided"),

  body("templateExercises.*.weight")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage(
      "Weight must be a valid decimal number with up to 2 decimal places if provided",
    ),

  body("templateExercises.*.position")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Position must be a positive integer if provided"),
];
