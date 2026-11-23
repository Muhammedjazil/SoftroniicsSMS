const express = require("express");
const router = express.Router();
const {
  getInternWeeklySchedule,
  getInternWeeklyCard,
} = require("../Controllers/internScheduleController");

router.get("/", getInternWeeklySchedule);
router.get("/weeklycard", getInternWeeklyCard);

module.exports = router;