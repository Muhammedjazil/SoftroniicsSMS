const express = require("express");
const router = express.Router();
const {
  getMentors,
  getMentorScheduleDetails,
} = require("../Controllers/mentorBatchController");

router.get("/mentors", getMentors);
router.get("/:mentorId", getMentorScheduleDetails);

module.exports = router;