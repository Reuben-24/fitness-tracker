const express = require("express");
const path = require("path");
require("dotenv").config();

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const exercisesRouter = require("./routes/exercises");
const muscleGroupsRouter = require("./routes/muscleGroups");
const workoutTemplatesRouter = require("./routes/workoutTemplates");
const workoutSessionsRouter = require("./routes/workoutSessions");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/exercises", exercisesRouter);
app.use("/muscle-groups", muscleGroupsRouter);
app.use("/workout-templates", workoutTemplatesRouter);
app.use("/workout-sessions", workoutSessionsRouter);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err); // log full error on server

  // TODO: Customize depending on error type
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));