const jwt = require("jsonwebtoken");
const { User } = require("../Models/userModel");
const { Staff } = require("../Models/staffModel");

const JWT_SECRET = process.env.JWT_SECRET || "softroniics_sms_secret_2026";

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

    const decoded = jwt.verify(token, JWT_SECRET);

    req.userId = decoded.id;
    req.userType = decoded.userType;
    req.userRole = decoded.role;
    req.user = decoded;

    next();
  } catch (error) {
    console.log("Authentication Error:", error.message);
    return res.status(401).json({
      message: "Invalid or Expired Token",
    });
  }
};

/**
 * Middleware to enforce role-based module & action permissions.
 * Example: checkPermission("batchManagement", "addBatch")
 */
const checkPermission = (moduleKey, actionKey) => {
  return async (req, res, next) => {
    try {
      // Super Admin / Admin account bypasses granular checks
      if (
        req.userType === "admin" ||
        (req.userRole && /^super\s*admin$/i.test(req.userRole))
      ) {
        return next();
      }

      if (req.userType !== "staff") {
        return res.status(403).json({
          message: "Access denied. Staff or Admin privileges required.",
        });
      }

      const staff = await Staff.findById(req.userId).populate(
        "role",
        "role isActive permissions"
      );

      if (!staff || staff.isDeleted || !staff.isActive) {
        return res.status(403).json({
          message: "Account inactive or not found.",
        });
      }

      if (!staff.role || !staff.role.isActive) {
        return res.status(403).json({
          message: "Assigned role is inactive or missing.",
        });
      }

      const hasAccess = !!staff.role.permissions?.[moduleKey]?.[actionKey];

      if (!hasAccess) {
        return res.status(403).json({
          message: `Access denied: You do not have '${actionKey}' permission for ${moduleKey}.`,
        });
      }

      req.permissions = staff.role.permissions;
      next();
    } catch (error) {
      console.error("Permission Check Error:", error);
      return res.status(500).json({
        message: "Error verifying permissions",
        error: error.message,
      });
    }
  };
};

module.exports = {
  checkAuth,
  checkPermission,
};