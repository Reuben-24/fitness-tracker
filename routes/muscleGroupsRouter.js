const { Router } = require("express");
const asyncHandler = require("../utils/asyncHandler");
const muscleGroupsController = require("../controllers/muscleGroupsController");

const muscleGroupsRouter = Router({ mergeParams: true });

muscleGroupsRouter.post("/", asyncHandler(muscleGroupsController.create));
muscleGroupsRouter.get(
  "/",
  asyncHandler(muscleGroupsController.readAllForUser)
);
muscleGroupsRouter.get(
  "/:muscleGroupId",
  asyncHandler(muscleGroupsController.readForUserById)
);
muscleGroupsRouter.patch(
  "/:muscleGroupId",
  asyncHandler(muscleGroupsController.update)
);
muscleGroupsRouter.delete(
  "/:muscleGroupId",
  asyncHandler(muscleGroupsController.delete)
);

module.exports = muscleGroupsRouter;
