const { Router } = require("express");
const asyncHandler = require("../utils/asyncHandler");
const workoutTemplatesController = require("../controllers/workoutTemplatesController");

const workoutTemplatesRouter = Router({ mergeParams: true });

workoutTemplatesRouter.post(
  "/",
  asyncHandler(workoutTemplatesController.create),
);
workoutTemplatesRouter.get(
  "/",
  asyncHandler(workoutTemplatesController.readAllForUser),
);
workoutTemplatesRouter.get(
  "/:templateId",
  asyncHandler(workoutTemplatesController.readForUserById),
);
workoutTemplatesRouter.put(
  "/:templateId",
  asyncHandler(workoutTemplatesController.update),
);
workoutTemplatesRouter.delete(
  "/:templateId",
  asyncHandler(workoutTemplatesController.delete),
);

module.exports = workoutTemplatesRouter;
