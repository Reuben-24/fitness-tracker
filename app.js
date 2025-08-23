const express = require("express");
const path = require("path");
require("dotenv").config();

const usersRouter = require("./routes/usersRouter.js")
const exercisesRouter = require("./routes/exercisesRouter.js")

app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", usersRouter);
app.use("/users/:userId/exercises", exercisesRouter)

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err); // log full error on server

  // Customize depending on error type
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

app.listen(process.env.PORT);