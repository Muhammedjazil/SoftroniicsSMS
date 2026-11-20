
const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check whether token exists
    if (!authHeader) {
      return res.status(401).json({
        message: "No Token Provided"
      });
    }

    // Remove Bearer prefix
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store user ID in request
    req.userId = decoded._id;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or Expired Token"
    });
  }
};

module.exports = checkAuth;
