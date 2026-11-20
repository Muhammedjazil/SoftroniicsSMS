const express = require("express");
const router = express.Router();
const {
  getInternWeeklySchedule,
} = require("../Controllers/internScheduleController");

router.get("/", getInternWeeklySchedule);

module.exports = router;