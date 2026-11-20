const express = require("express");
const router = express.Router();
const {
  getWeeklyScheduleMatrix,
  upsertScheduleCell,
  cloneScheduleToNextWeek,
} = require("../Controllers/weeklyScheduleController");

router.get("/", getWeeklyScheduleMatrix);
router.post("/cell", upsertScheduleCell);
router.post("/clone-next", cloneScheduleToNextWeek);

module.exports = router;