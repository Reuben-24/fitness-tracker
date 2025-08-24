const { Router } = require("express");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const auth = require("../middleware/authenticate");
const controller = require("../controllers/users");

const router = Router();

router.post("/", asyncErrorHandler(controller.create));
router.get("/:userId", auth, asyncErrorHandler(controller.read));
router.patch("/:userId", auth, asyncErrorHandler(controller.update));
router.delete("/:userId", auth, asyncErrorHandler(controller.delete));

module.exports = router;
