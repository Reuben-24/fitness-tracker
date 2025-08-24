const { Router } = require("express");
const asyncErrorHandler = require("../utils/asyncHandler");
const auth = require("../middleware/authenticate");
const controller = require("../controllers/muscleGroups");

const router = Router({ mergeParams: true });

router.use(auth);

router.post("/", asyncErrorHandler(controller.create));
router.get("/", asyncErrorHandler(controller.readAllForUser));
router.get("/:muscleGroupId", asyncErrorHandler(controller.readForUserById));
router.patch("/:muscleGroupId", asyncErrorHandler(controller.update));
router.delete("/:muscleGroupId", asyncErrorHandler(controller.delete));

module.exports = router;
