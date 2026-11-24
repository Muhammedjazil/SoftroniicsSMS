const Attendance = require("../Models/attendanceModel");
const Intern = require("../Models/internModel");

// GET STUDENTS FOR ATTENDANCE
const getAttendanceStudents = async (req, res) => {
  try {
    const { branch, batch } = req.query;

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

    res.status(200).json(students);
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
      .populate("batch", "batchName");

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

    const result = students.map(student => ({
      _id: student._id,
      fullName: student.fullName,
      email: student.email,
      course: student.course?.courseName || "",
      batch: student.batch?.batchName || "",
      attendance: recordsMap.get(student._id.toString()) || "UNMARKED",
      status: recordsMap.has(student._id.toString())
        ? "Created"
        : "Not Created"
    }));

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
    const { date, branch, students } = req.body;

    if (!date || !branch || !Array.isArray(students) || !students.length) {
      return res.status(400).json({
        message: "Date, branch and students are required"
      });
    }

    const selectedDate = new Date(`${date}T00:00:00.000Z`);

    const operations = students.map(student => {
      if (!["present", "absent", "PRESENT", "ABSENT"].includes(student.attendance)) {
        throw new Error("Each student must have a present or absent status");
      }

      return {
        updateOne: {
          filter: {
            intern: student.studentId,
            date: selectedDate
          },
          update: {
            $set: {
              intern: student.studentId,
              branch,
              batch: student.batch,
              date: selectedDate,
              status: student.attendance.toUpperCase()
            }
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

    if (branch) {
      filter.branch = branch;
    }

    if (month && year) {
      const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
      const endDate = new Date(Date.UTC(Number(year), Number(month), 1));

      filter.date = {
        $gte: startDate,
        $lt: endDate
      };
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