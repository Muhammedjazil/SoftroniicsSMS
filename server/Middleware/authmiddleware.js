const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No Token Provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded._id;

    next();
  } catch (error) {
    console.log("Authentication Error:", error.message);

    return res.status(401).json({
      message: "Invalid or Expired Token",
    });
  }
};

module.exports = checkAuth;