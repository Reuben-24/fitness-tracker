const authorizeParam = (paramName = "userId") => {
  return (req, res, next) => {
    const authenticatedUserId = req.user.id; 
    const resourceUserId = req.validated?.params?.[paramName];

    if (!resourceUserId) {
      return res.status(400).json({ error: `${paramName} is missing` });
    }

    if (authenticatedUserId !== resourceUserId) {
      return res.status(403).json({ error: "Forbidden: You do not have access to this resource" });
    }

    next();
  };
};

module.exports = { authorizeParam };
