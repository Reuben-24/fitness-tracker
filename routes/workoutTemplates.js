const { Router } = require("express");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const auth = require("../middleware/authenticate");
const controller = require("../controllers/workoutTemplates");
const validate = require("../middleware/validate");
const validator = require("../validators/workoutTemplates");
const commonValidator = require("../validators/common");

const router = Router({ mergeParams: true });

router.use(auth);

router.get("/", asyncErrorHandler(controller.readAllForUser));

router.get("/:workoutTemplateId", validate(commonValidator.idParam("workoutTemplateId")), asyncErrorHandler(controller.readForUserById));

router.post("/", validate(validator.create), asyncErrorHandler(controller.create));

router.patch("/:workoutTemplateId", validate([...commonValidator.idParam("workoutTemplateId"), ...validator.update]), asyncErrorHandler(controller.update));

router.delete("/:workoutTemplateId", validate(commonValidator.idParam("workoutTemplateId")), asyncErrorHandler(controller.delete));

module.exports = router;
