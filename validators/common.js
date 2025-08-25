const { param } = require("express-validator");

exports.idParam = (name = "userId") => [
  param(name)
    .isInt({ gt: 0 })
    .toInt()
    .withMessage(`${name} must be a positive integer`),
];
