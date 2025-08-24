const { Router } = require("express");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const auth = require("../middleware/authenticate");
const controller = require("../controllers/users");
const validate = require("../middleware/validate");
const validator = require("../validators/users");
const commonValidator = require("../validators/common");

const router = Router();

router.post(
  "/",
  validate(validator.create),
  asyncErrorHandler(controller.create)
);

router.get(
  "/:userId", 
  auth,
  validate(commonValidator.idParam("userId")), 
  asyncErrorHandler(controller.read)
);

router.patch(
  "/:userId",
  auth,
  validate([...commonValidator.idParam("userId"), ...validator.update]),
  asyncErrorHandler(controller.update)
);

router.delete(
  "/:userId",
  auth,
  validate(commonValidator.idParam("userId")),
  asyncErrorHandler(controller.delete)
);

module.exports = router;