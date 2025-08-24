const { Router } = require("express");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const auth = require("../middleware/authenticate");
const controller = require("../controllers/workoutSessions");

const router = Router({ mergeParams: true });

router.use(auth);

router.get("/", asyncErrorHandler(controller.readAllForUser));
router.post("/", asyncErrorHandler(controller.create));
router.get("/:sessionId", asyncErrorHandler(controller.readForUserById));
router.put("/:sessionId", asyncErrorHandler(controller.update));
router.delete("/:sessionId", asyncErrorHandler(controller.delete));

module.exports = router;
