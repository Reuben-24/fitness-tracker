const { Router } = require("express");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const controller = require("../controllers/auth");
const validator = require("../validators/auth");
const validate = require("../middleware/validate");

const router = Router();

router.post(
  "/login",
  validate(validator.login),
  asyncErrorHandler(controller.login),
);

router.post(
  "/logout",
  validate(validator.logout),
  asyncErrorHandler(controller.logout),
);

router.post(
  "/refresh-token",
  validate(validator.refreshToken),
  asyncErrorHandler(controller.refreshToken),
);

module.exports = router;
