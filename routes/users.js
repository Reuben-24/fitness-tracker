const { Router } = require("express");
const asyncErrorHandler = require("../utils/asyncHandler");
const auth = require("../middleware/authenticate");
const controller = require("../controllers/users");

const router = Router();

router.use(auth);

router.post("/", asyncErrorHandler(controller.create));
router.get("/:userId", asyncErrorHandler(controller.read));
router.patch("/:userId", asyncErrorHandler(controller.update));
router.delete("/:userId", asyncErrorHandler(controller.delete));

module.exports = router;
