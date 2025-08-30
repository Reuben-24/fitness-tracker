const { validationResult, matchedData } = require("express-validator");

// Helper to format errors
const formatError = (e) => ({
  msg: e.msg,
  path: e.param || e.path,
  location: e.location,
});

const validate = (checks) => async (req, res, next) => {
  // Run all checks
  await Promise.all(checks.map((c) => c.run(req)));

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      errors: result.array({ onlyFirstError: true }).map(formatError),
    });
  }

  // Keep only the validated + sanitized fields
  req.validated = {
    body: matchedData(req, { locations: ["body"] }),
    query: matchedData(req, { locations: ["query"] }),
    params: matchedData(req, { locations: ["params"] }),
  };

  return next();
};

module.exports = validate;
