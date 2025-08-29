const { body } = require("express-validator");

exports.create = [
  body("workoutTemplateId")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("Workout Template ID must be a positive integer")
    .toInt(),

  body("startedAt")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("startedAt must be a valid date")
    .toDate(),

  body("finishedAt")
    .isISO8601()
    .withMessage("finishedAt is required and must be a valid date")
    .toDate(),

  // Validate sessionExercises
  body("sessionExercises")
    .optional()
    .isArray()
    .withMessage("sessionExercises must be an array"),

  body("sessionExercises.*.exerciseId")
    .isInt({ gt: 0 })
    .withMessage("exerciseId must be a positive integer")
    .toInt(),

  body("sessionExercises.*.position")
    .isInt({ gt: 0 })
    .withMessage("position must be a positive integer")
    .toInt(),

  // Validate exerciseSets
  body("sessionExercises.*.exerciseSets")
    .optional()
    .isArray()
    .withMessage("exerciseSets must be an array"),

  body("sessionExercises.*.exerciseSets.*.setNumber")
    .isInt({ gt: 0 })
    .withMessage("setNumber must be a positive integer")
    .toInt(),

  body("sessionExercises.*.exerciseSets.*.reps")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("reps must be a positive integer")
    .toInt(),

  body("sessionExercises.*.exerciseSets.*.weight")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage(
      "weight must be a valid decimal number with up to 2 decimal places",
    )
    .toFloat(),

  body("sessionExercises.*.exerciseSets.*.completed")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("completed must be a boolean")
    .toBoolean(),
];

exports.update = [
  body("workoutTemplateId")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("Workout Template ID must be a positive integer")
    .toInt(),

  body("startedAt")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("startedAt must be a valid date")
    .toDate(),

  body("finishedAt")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("finishedAt must be a valid date")
    .toDate(),

  body("sessionExercises")
    .optional({ nullable: true })
    .isArray()
    .withMessage("sessionExercises must be an array"),

  body("sessionExercises.*.exerciseId")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("exerciseId must be a positive integer")
    .toInt(),

  body("sessionExercises.*.position")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("position must be a positive integer")
    .toInt(),

  body("sessionExercises.*.exerciseSets")
    .optional({ nullable: true })
    .isArray()
    .withMessage("exerciseSets must be an array"),

  body("sessionExercises.*.exerciseSets.*.setNumber")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("setNumber must be a positive integer")
    .toInt(),

  body("sessionExercises.*.exerciseSets.*.reps")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("reps must be a positive integer")
    .toInt(),

  body("sessionExercises.*.exerciseSets.*.weight")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage(
      "weight must be a valid decimal number with up to 2 decimal places",
    )
    .toFloat(),

  body("sessionExercises.*.exerciseSets.*.completed")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("completed must be a boolean")
    .toBoolean(),
];
