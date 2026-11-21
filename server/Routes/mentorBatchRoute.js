const express = require("express");
const router = express.Router();
const { checkAuth, checkPermission } = require("../Middleware/checkAuth");
const {
  getMentors,
  getMentorScheduleDetails,
} = require("../Controllers/mentorBatchController");

router.get("/mentors", checkAuth, checkPermission("mentorManagement", "viewMentor"), getMentors);
router.get("/:mentorId", checkAuth, checkPermission("mentorManagement", "viewMentor"), getMentorScheduleDetails);

module.exports = router;