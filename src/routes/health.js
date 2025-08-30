const { Router } = require("express");
const prisma = require("../../prisma/prisma");

const router = Router();

/**
 * Health check endpoint
 * - Returns 200 if server and database are reachable
 * - Returns 500 if database check fails
 */
router.get("/", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      message: "Server and database are healthy",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "error",
      message: "Database unreachable",
      details: error.message,
    });
  }
});

module.exports = router;
