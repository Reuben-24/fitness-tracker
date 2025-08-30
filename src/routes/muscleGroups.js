const { Router } = require("express");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const auth = require("../middleware/authenticate");
const controller = require("../controllers/muscleGroups");
const validate = require("../middleware/validate");
const validator = require("../validators/muscleGroups");
const commonValidator = require("../validators/common");

const router = Router({ mergeParams: true });

router.use(auth);

router.get("/", asyncErrorHandler(controller.readAllForUser));

router.get(
  "/:muscleGroupId",
  validate(commonValidator.idParam("muscleGroupId")),
  asyncErrorHandler(controller.readForUserById),
);

router.post(
  "/",
  validate(validator.create),
  asyncErrorHandler(controller.create),
);

router.patch(
  "/:muscleGroupId",
  validate([...commonValidator.idParam("muscleGroupId"), ...validator.update]),
  asyncErrorHandler(controller.update),
);

router.delete(
  "/:muscleGroupId",
  validate(commonValidator.idParam("muscleGroupId")),
  asyncErrorHandler(controller.delete),
);

module.exports = router;
