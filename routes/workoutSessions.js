const { Router } = require("express");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const auth = require("../middleware/authenticate");
const controller = require("../controllers/workoutSessions");
const validate = require("../middleware/validate");
const validator = require("../validators/workoutSessions");
const commonValidator = require("../validators/common");

const router = Router();

router.use(auth);

router.get("/", asyncErrorHandler(controller.readAllForUser));

router.get(
  "/:workoutSessionId",
  validate(commonValidator.idParam("workoutSessionId")),
  asyncErrorHandler(controller.readForUserById),
);

router.post(
  "/",
  validate(validator.create),
  asyncErrorHandler(controller.create),
);

router.patch(
  "/:workoutSessionId",
  validate([
    ...commonValidator.idParam("workoutSessionId"),
    ...validator.update,
  ]),
  asyncErrorHandler(controller.update),
);

router.delete(
  "/:workoutSessionId",
  validate(commonValidator.idParam("workoutSessionId")),
  asyncErrorHandler(controller.delete),
);

module.exports = router;
