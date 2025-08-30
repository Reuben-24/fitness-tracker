const express = require("express");
require("dotenv").config();

const errorHandler = require("./middleware/errorHandler");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const exercisesRouter = require("./routes/exercises");
const muscleGroupsRouter = require("./routes/muscleGroups");
const workoutTemplatesRouter = require("./routes/workoutTemplates");
const workoutSessionsRouter = require("./routes/workoutSessions");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/exercises", exercisesRouter);
apiRouter.use("/muscle-groups", muscleGroupsRouter);
apiRouter.use("/workout-templates", workoutTemplatesRouter);
apiRouter.use("/workout-sessions", workoutSessionsRouter);

app.use("/api", apiRouter);

// Error Handler
app.use(errorHandler);

module.exports = app;
