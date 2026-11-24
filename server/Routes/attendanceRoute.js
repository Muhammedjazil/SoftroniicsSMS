const express = require("express");
const router = express.Router();

const {
  getAttendanceStudents,
  createDailyAttendance,
  saveAttendance,
  getAttendanceReports
} = require("../Controllers/attendanceController");

router.get("/students", getAttendanceStudents);
router.get("/create", createDailyAttendance);
router.post("/save", saveAttendance);
router.get("/reports", getAttendanceReports);

module.exports = router;