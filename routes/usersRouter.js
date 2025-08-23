const { Router } = require("express");
const asyncHandler = require("../utils/asyncHandler");
const usersController = require("../controllers/usersController");

const usersRouter = Router();

usersRouter.post("/", asyncHandler(usersController.create));
usersRouter.get("/:userId", asyncHandler(usersController.read));
usersRouter.patch("/:userId", asyncHandler(usersController.update));
usersRouter.delete("/:userId", asyncHandler(usersController.delete));

module.exports = usersRouter;
