const { Router } = require("express");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const controller = require("../controllers/auth");
const validator = require("../validators/auth")

const router = Router();

router.post("/login", validator.login, asyncErrorHandler(controller.login));
router.post("/logout", asyncErrorHandler(controller.logout));
router.post("/refresh-token", asyncErrorHandler(controller.refreshToken));

module.exports = router;
