const { Prisma } = require("@prisma/client");

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: `A record with that ${err.meta.target} already exists`,
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        error: `A record with that ${err.meta.target} cannot be found`,
      });
    }
  }

  // Prisma validation error
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: "Invalid data sent to database" });
  }

  // JWT / auth errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Fallback
  res.status(500).json({ error: "Internal server error" });
}

module.exports = errorHandler;
