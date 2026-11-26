const express = require("express");
const router = express.Router();
const { checkAuth, checkPermission } = require("../Middleware/checkAuth");

const {
  getAttendanceStudents,
  createDailyAttendance,
  saveAttendance,
  getAttendanceReports,
  getMyAttendance
} = require("../Controllers/attendanceController");

router.get("/students", getAttendanceStudents);
router.get("/create", createDailyAttendance);
router.post("/save", saveAttendance);
router.get("/reports", getAttendanceReports);

router.get("/my-attendance",checkAuth,getMyAttendance);

module.exports = router;