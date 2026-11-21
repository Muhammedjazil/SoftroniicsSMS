const express = require("express");
const router = express.Router();
const { checkAuth, checkPermission } = require("../Middleware/checkAuth");
const {
  getWeeklyScheduleMatrix,
  upsertScheduleCell,
  cloneScheduleToNextWeek,
} = require("../Controllers/weeklyScheduleController");

router.get("/", checkAuth, checkPermission("weeklySchedule", "viewSchedule"), getWeeklyScheduleMatrix);
router.post("/cell", checkAuth, checkPermission("weeklySchedule", "editSchedule"), upsertScheduleCell);
router.post("/clone-next", checkAuth, checkPermission("weeklySchedule", "addSchedule"), cloneScheduleToNextWeek);

module.exports = router;