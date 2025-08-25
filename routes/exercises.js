const { Router } = require("express");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const auth = require("../middleware/authenticate");
const controller = require("../controllers/exercises");
const validate = require("../middleware/validate");
const validator = require("../validators/exercises");
const commonValidator = require("../validators/common");

const router = Router();

router.use(auth);

router.post(
  "/",
  validate(validator.create),
  asyncErrorHandler(controller.create)
);

router.get("/", asyncErrorHandler(controller.readAllForUser));

router.get(
  "/:exerciseId",
  validate(commonValidator.idParam("exerciseId")),
  asyncErrorHandler(controller.readForUserById)
);       

router.patch(
  "/:exerciseId",
  validate(commonValidator.idParam("exerciseId")),
  asyncErrorHandler(controller.update)
);

router.delete(
  "/:exerciseId",
  validate(commonValidator.idParam("exerciseId")),
  asyncErrorHandler(controller.delete)
);

router.post(
  "/:exerciseId/muscle-groups/:muscleGroupId",
  validate([
    ...commonValidator.idParam("exerciseId"),
    ...validate(commonValidator.idParam("exerciseId")),
  ]),
  asyncErrorHandler(controller.addMuscleGroup)
);

router.delete(
  "/:exerciseId/muscle-groups/:muscleGroupId",
  validate([
    ...commonValidator.idParam("exerciseId"),
    ...validate(commonValidator.idParam("exerciseId")),
  ]),
  asyncErrorHandler(controller.removeMuscleGroup)
);

router.get(
  "/:exerciseId/muscle-groups",
  asyncErrorHandler(controller.readMuscleGroups)
);

module.exports = router;