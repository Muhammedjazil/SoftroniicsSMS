
const express = require("express");
const router = express.Router();

const checkAuth = require("../Middleware/authmiddleware");
const upload = require("../Middleware/upload");

const {
  takeroletitle,
  createstaff,
} = require("../Controllers/staffController");

// Fetch active roles
router.get("/", checkAuth, takeroletitle);

// Create staff
router.post(
  "/",
  checkAuth,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  createstaff
);

module.exports = router;
