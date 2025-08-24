const { Router } = require("express");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const auth = require("../middleware/authenticate");
const controller = require("../controllers/workoutTemplates");

const router = Router({ mergeParams: true });

router.use(auth);

router.post("/", asyncErrorHandler(controller.create));
router.get("/", asyncErrorHandler(controller.readAllForUser));
router.get("/:templateId", asyncErrorHandler(controller.readForUserById));
router.put("/:templateId", asyncErrorHandler(controller.update));
router.delete("/:templateId", asyncErrorHandler(controller.delete));

module.exports = router;
