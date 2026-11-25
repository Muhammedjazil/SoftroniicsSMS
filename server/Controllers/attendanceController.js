const mongoose = require("mongoose");
const Attendance = require("../Models/attendanceModel");
const Intern = require("../Models/internModel");
require("../Models/branchModel");
require("../Models/batchModel");
require("../Models/courseModel");

// GET STUDENTS FOR ATTENDANCE
const getAttendanceStudents = async (req, res) => {
  try {
    const { branch, batch, date } = req.query;

    if (!branch) {
      return res.status(400).json({
        message: "Branch is required"
      });
    }

    const filter = {
      branch,
      isDeleted: false,
      isActive: true
    };

    if (batch && batch !== "All Batches") {
      filter.batch = batch;
    }

    const students = await Intern.find(filter)
      .populate("course", "courseName")
      .populate("branch", "branchName")
      .populate("batch", "batchName")
      .select("fullName email admissionNumber course branch batch");

    // If date is provided, check existing Attendance records for that date
    const recordsMap = new Map();
    if (date) {
      const selectedDate = new Date(`${date}T00:00:00.000Z`);
      const attendanceRecords = await Attendance.find({
        branch,
        date: selectedDate
      });

      attendanceRecords.forEach(record => {
        recordsMap.set(record.intern.toString(), record.status);
      });
    }

    const result = students.map(student => {
      const hasRecord = recordsMap.has(student._id.toString());
      const recordStatus = recordsMap.get(student._id.toString());

      return {
        _id: student._id,
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        admissionNumber: student.admissionNumber,
        course: student.course,
        branch: student.branch,
        batch: student.batch,
        attendance: hasRecord ? recordStatus.toLowerCase() : "unmarked",
        attendanceCreated: hasRecord,
        status: hasRecord ? "Created" : "Not Created"
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance students",
      error: error.message
    });
  }
};

// CREATE / LOAD DAILY ATTENDANCE
const createDailyAttendance = async (req, res) => {
  try {
    const { date, branch, batch } = req.query;

    if (!date || !branch) {
      return res.status(400).json({
        message: "Date and branch are required"
      });
    }

    const filter = {
      branch,
      isDeleted: false,
      isActive: true
    };

    if (batch && batch !== "All Batches") {
      filter.batch = batch;
    }

    const students = await Intern.find(filter)
      .populate("course", "courseName")
      .populate("branch", "branchName")
      .populate("batch", "batchName")
      .select("fullName email admissionNumber course branch batch");

    const selectedDate = new Date(`${date}T00:00:00.000Z`);

    const attendanceRecords = await Attendance.find({
      branch,
      date: selectedDate
    });

    const recordsMap = new Map(
      attendanceRecords.map(record => [
        record.intern.toString(),
        record.status
      ])
    );

    const result = students.map(student => {
      const hasRecord = recordsMap.has(student._id.toString());
      const recordStatus = recordsMap.get(student._id.toString());

      return {
        _id: student._id,
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        admissionNumber: student.admissionNumber,
        course: student.course,
        branch: student.branch,
        batch: student.batch,
        attendance: hasRecord ? recordStatus.toLowerCase() : "unmarked",
        attendanceCreated: true,
        status: "Created"
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error loading daily attendance",
      error: error.message
    });
  }
};

// SAVE ATTENDANCE
const saveAttendance = async (req, res) => {
  try {
    const { date, branch, students, batch } = req.body;

    if (!date || !branch || !Array.isArray(students) || !students.length) {
      return res.status(400).json({
        message: "Date, branch and students are required"
      });
    }

    const selectedDate = new Date(`${date}T00:00:00.000Z`);

    const operations = students.map(student => {
      const internId =
        student.internId ||
        student.studentId ||
        student.id ||
        student._id;

      if (!internId) {
        throw new Error("Missing intern id for attendance record");
      }

      let rawStatus = (
        student.status ||
        student.attendance ||
        ""
      ).toUpperCase();

      if (!["PRESENT", "ABSENT"].includes(rawStatus)) {
        if (rawStatus === "PRESENT" || rawStatus === "1" || rawStatus === "TRUE") {
          rawStatus = "PRESENT";
        } else if (rawStatus === "ABSENT" || rawStatus === "0" || rawStatus === "FALSE") {
          rawStatus = "ABSENT";
        } else {
          throw new Error("Each student must have a present or absent status");
        }
      }

      const updateSet = {
        intern: internId,
        branch,
        date: selectedDate,
        status: rawStatus
      };

      const resolvedBatch =
        student.batch || (batch && batch !== "All Batches" ? batch : null);

      if (resolvedBatch && mongoose.Types.ObjectId.isValid(resolvedBatch)) {
        updateSet.batch = resolvedBatch;
      }

      return {
        updateOne: {
          filter: {
            intern: internId,
            date: selectedDate
          },
          update: {
            $set: updateSet
          },
          upsert: true
        }
      };
    });

    await Attendance.bulkWrite(operations);

    res.status(200).json({
      message: "Attendance saved successfully"
    });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({
      message: "Error saving attendance",
      error: error.message
    });
  }
};

// GET ATTENDANCE REPORTS
const getAttendanceReports = async (req, res) => {
  try {
    const { branch, month, year } = req.query;

    const filter = {};

    if (branch && branch !== "All Branches") {
      filter.branch = branch;
    }

    if (month && year) {
      let monthNum = Number(month);
      if (isNaN(monthNum)) {
        const monthNames = [
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december"
        ];
        const idx = monthNames.indexOf(String(month).trim().toLowerCase());
        if (idx !== -1) {
          monthNum = idx + 1;
        }
      }

      if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        const startDate = new Date(Date.UTC(Number(year), monthNum - 1, 1));
        const endDate = new Date(Date.UTC(Number(year), monthNum, 1));

        filter.date = {
          $gte: startDate,
          $lt: endDate
        };
      }
    }

    const reports = await Attendance.find(filter)
      .populate({
        path: "intern",
        select: "fullName email admissionNumber"
      })
      .populate("branch", "branchName")
      .populate("batch", "batchName")
      .sort({ date: -1 });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance reports",
      error: error.message
    });
  }
};

module.exports = {
  getAttendanceStudents,
  createDailyAttendance,
  saveAttendance,
  getAttendanceReports
};