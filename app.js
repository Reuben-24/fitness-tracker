const express = require("express");
require("dotenv").config();

const errorHandler = require("./middleware/errorHandler");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const exercisesRouter = require("./routes/exercises");
const muscleGroupsRouter = require("./routes/muscleGroups");
const workoutTemplatesRouter = require("./routes/workoutTemplates");
//const workoutSessionsRouter = require("./routes/workoutSessions");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/exercises", exercisesRouter);
app.use("/muscle-groups", muscleGroupsRouter);
app.use("/workout-templates", workoutTemplatesRouter);
//app.use("/workout-sessions", workoutSessionsRouter);

app.use(errorHandler);

module.exports = app;
