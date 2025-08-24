const { Router } = require("express");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const auth = require("../middleware/authenticate");
const controller = require("../controllers/exercises");

const router = Router({ mergeParams: true });

router.use(auth);

router.post("/", asyncErrorHandler(controller.create));
router.get("/", asyncErrorHandler(controller.readAllForUser));
router.get("/:exerciseId", asyncErrorHandler(controller.readForUserById));
router.patch("/:exerciseId", asyncErrorHandler(controller.update));
router.delete("/:exerciseId", asyncErrorHandler(controller.delete));
router.post(
  "/:exerciseId/muscle-groups/:muscleGroupId",
  asyncErrorHandler(controller.addMuscleGroup),
);
router.delete(
  "/:exerciseId/muscle-groups/:muscleGroupId",
  asyncErrorHandler(controller.removeMuscleGroup),
);
router.get(
  "/:exerciseId/muscle-groups",
  asyncErrorHandler(controller.readMuscleGroups),
);

module.exports = router;
