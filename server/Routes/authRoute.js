const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginUser,
  getCurrentUser,
} = require("../Controllers/authController");

router.post("/register-admin", registerAdmin);
router.post("/login", loginUser);
router.get("/me", getCurrentUser);

module.exports = router;