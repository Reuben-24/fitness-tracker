const { Router } = require("express");
const asyncHandler = require("../utils/asyncHandler");
const exercisesController = require("../controllers/exercisesController")

const exercisesRouter = Router({ mergeParams: true })

exercisesRouter.post("/", asyncHandler(exercisesController.create));
exercisesRouter.get("/", asyncHandler(exercisesController.readAllForUser));
exercisesRouter.get("/:exerciseId", asyncHandler(exercisesController.readForUserById));
exercisesRouter.patch("/:exerciseId", asyncHandler(exercisesController.update));
exercisesRouter.delete("/:exerciseId", asyncHandler(exercisesController.delete));

module.exports = exercisesRouter;