const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: "No token provided" });

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.user = { id: payload.userId }; // store user info for controllers
  next();
};

module.exports = authenticate;
