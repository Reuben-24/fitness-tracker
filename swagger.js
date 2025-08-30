const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fitness Tracker API",
      version: "1.0.0",
      description: "A REST API for tracking workouts, exercises, and progress.",
    },
    servers: [{ url: `${SERVER_URL}/api` }],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
