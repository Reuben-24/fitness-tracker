const { Router } = require("express");
const asyncHandler = require("../utils/asyncHandler");
const workoutSessionsController = require("../controllers/workoutSessionsController");

const workoutSessionsRouter = Router({ mergeParams: true });

workoutSessionsRouter.get(
  "/",
  asyncHandler(workoutSessionsController.readAllForUser),
);
workoutSessionsRouter.post("/", asyncHandler(workoutSessionsController.create));
workoutSessionsRouter.get(
  "/:sessionId",
  asyncHandler(workoutSessionsController.readForUserById),
);
workoutSessionsRouter.put(
  "/:sessionId",
  asyncHandler(workoutSessionsController.update),
);
workoutSessionsRouter.delete(
  "/:sessionId",
  asyncHandler(workoutSessionsController.delete),
);

module.exports = workoutSessionsRouter;
