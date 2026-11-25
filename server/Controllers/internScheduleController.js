const mongoose = require("mongoose");
const Batch = require("../Models/batchModel");
const Intern = require("../Models/internModel");
const WeeklySchedule = require("../Models/weeklyScheduleModel");
const MentorCard = require("../Models/mentorCardModel");
const InternsAttendance = require("../Models/internsAttendanceModel");
const Attendance = require("../Models/attendanceModel");
require("../Models/branchModel");
require("../Models/staffModel");
require("../Models/courseModel");
require("../Models/timingModel");
require("../Models/dayModel");
require("../Models/dayCombinationModel");
require("../Models/moduleModel");

// Helper: Normalize 7-day range from startDate string (YYYY-MM-DD) in local time
const getWeekRange = (startDateStr) => {
  const [y, m, d] = startDateStr.split("-").map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d + 6, 23, 59, 59, 999);
  return { start, end };
};

// Helper: Extract weekday names ("MONDAY", etc.) from DayCombination
const extractUpperDays = (dayCombObj) => {
  if (!dayCombObj) return [];
  if (typeof dayCombObj === "string") return [dayCombObj.toUpperCase()];

  if (
    Array.isArray(dayCombObj.dayCombination) &&
    dayCombObj.dayCombination.length > 0
  ) {
    return dayCombObj.dayCombination
      .map((d) => {
        if (typeof d === "string") return d.toUpperCase();
        if (typeof d === "object" && d !== null) {
          return (d.day || d.name || "").toUpperCase();
        }
        return null;
      })
      .filter(Boolean);
  }

  if (dayCombObj.name) {
    return [dayCombObj.name.toUpperCase()];
  }

  return [];
};

// @desc    Get intern profile, assigned batches, and weekly schedule slots
// @route   GET /internschedule?internId=...&email=...&startDate=YYYY-MM-DD
const getInternWeeklySchedule = async (req, res) => {
  try {
    const { internId, email, startDate } = req.query;

    // 1. Find Intern by ID, email, or officialEmail
    let intern = null;
    if (internId && mongoose.Types.ObjectId.isValid(internId)) {
      intern = await Intern.findOne({ _id: internId, isDeleted: false })
        .populate("branch", "branchName name")
        .populate("course", "courseName");
    } else if (email && email.trim()) {
      const escapedEmail = email
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      intern = await Intern.findOne({
        $or: [
          { email: { $regex: `^${escapedEmail}$`, $options: "i" } },
          { officialEmail: { $regex: `^${escapedEmail}$`, $options: "i" } },
        ],
        isDeleted: false,
      })
        .populate("branch", "branchName name")
        .populate("course", "courseName");
    } else {
      intern = await Intern.findOne({ isDeleted: false, isActive: true })
        .populate("branch", "branchName name")
        .populate("course", "courseName");
    }

    if (!intern) {
      return res.status(404).json({ message: "Intern profile not found." });
    }

    // 2. Find all active Batches belonging to this Intern
    const batchOrConditions = [{ interns: intern._id }];
    const rawBatch = intern.batch ? String(intern.batch).trim() : "";

    if (rawBatch) {
      if (mongoose.Types.ObjectId.isValid(rawBatch)) {
        batchOrConditions.push({ _id: rawBatch });
      } else {
        batchOrConditions.push({
          batchName: {
            $regex: `^${rawBatch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
          },
        });
      }
    }

    const batches = await Batch.find({
      isDeleted: false,
      $or: batchOrConditions,
    }).populate("branch", "branchName name");

    const internBranchName =
      intern.branch?.branchName || intern.branch?.name || "calicut";

    const myBatches =
      batches.length > 0
        ? batches.map((b) => ({
            id: b._id,
            name: b.batchName,
            branch: b.branch?.branchName || b.branch?.name || internBranchName,
          }))
        : rawBatch
        ? [{ id: "assigned", name: rawBatch, branch: internBranchName }]
        : [];

    const batchIds = batches.map((b) => b._id);

    // 3. Query WeeklySchedule for those batch IDs within the selected 7-day range
    let weeklySlots = [];

    if (batchIds.length > 0) {
      const scheduleFilter = {
        isDeleted: { $ne: true },
        "schedule.sub_details.batch": { $in: batchIds },
      };

      if (startDate) {
        const { start, end } = getWeekRange(startDate);
        scheduleFilter.startDate = { $lte: end };
        scheduleFilter.endDate = { $gte: start };
      }

      const scheduleDocs = await WeeklySchedule.find(scheduleFilter)
        .populate("mentor", "fullName")
        .populate("schedule.time", "timeSlot")
        .populate({
          path: "schedule.sub_details.day",
          select: "name dayCombination",
          populate: {
            path: "dayCombination",
            select: "name day",
            strictPopulate: false,
          },
        })
        .populate({
          path: "schedule.sub_details.subject",
          select: "moduleName subjectName title name",
          strictPopulate: false,
        })
        .populate("schedule.sub_details.branch", "branchName name")
        .populate("schedule.sub_details.batch", "batchName");

      const dayOrder = {
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6,
        SUNDAY: 7,
      };

      scheduleDocs.forEach((doc) => {
        const sched = doc.schedule;
        if (!sched) return;

        const sub = sched.sub_details || {};
        const timeSlot = sched.time?.timeSlot || "Scheduled Slot";
        const mentorName = doc.mentor?.fullName || "Assigned Mentor";
        const subjectName =
          sub.subject?.moduleName ||
          sub.subject?.subjectName ||
          sub.subject?.title ||
          sub.subject?.name ||
          "General Session";
        const slotBranch =
          sub.branch?.branchName || sub.branch?.name || internBranchName;

        const matchedBatches = (sub.batch || []).filter((b) =>
          batchIds.some((id) => id.toString() === b._id.toString())
        );

        const daysList = extractUpperDays(sub.day);
        const displayDays = daysList.length > 0 ? daysList : ["SCHEDULED"];

        displayDays.forEach((dayUpper) => {
          matchedBatches.forEach((b) => {
            weeklySlots.push({
              id: `${doc._id}_${b._id}_${dayUpper}`,
              day: dayUpper,
              dayOrder: dayOrder[dayUpper] || 99,
              time: timeSlot,
              subject: subjectName,
              batch: b.batchName,
              branch: slotBranch,
              mentor: mentorName,
              note: sub.note || "",
            });
          });
        });
      });

      weeklySlots.sort((a, b) => {
        if (a.dayOrder !== b.dayOrder) return a.dayOrder - b.dayOrder;
        return a.time.localeCompare(b.time);
      });
    }

    return res.status(200).json({
      intern: {
        id: intern._id,
        name: (intern.fullName || intern.name || "INTERN").toUpperCase(),
        role: intern.role || "Intern",
        badgeRole: (intern.role || "INTERN").toUpperCase(),
        email: intern.email || intern.officialEmail,
      },
      myBatches,
      weeklySlots,
    });
  } catch (error) {
    console.error("Error fetching intern weekly schedule:", error);
    return res.status(500).json({
      message: "Server error while fetching intern weekly schedule",
      error: error.message,
    });
  }
};

// @desc    Get intern evaluation details, scores, and attendance for Weekly Card
// @route   GET /internschedule/weeklycard?internId=...&email=...
const getInternWeeklyCard = async (req, res) => {
  try {
    const { internId, email } = req.query;

    let intern = null;
    if (internId && mongoose.Types.ObjectId.isValid(internId)) {
      intern = await Intern.findOne({ _id: internId, isDeleted: false })
        .populate("branch", "branchName name")
        .populate("course", "courseName")
        .populate("batch", "batchName");
    } else if (email && email.trim()) {
      const escapedEmail = email.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      intern = await Intern.findOne({
        $or: [
          { email: { $regex: `^${escapedEmail}$`, $options: "i" } },
          { officialEmail: { $regex: `^${escapedEmail}$`, $options: "i" } },
        ],
        isDeleted: false,
      })
        .populate("branch", "branchName name")
        .populate("course", "courseName")
        .populate("batch", "batchName");
    } else {
      intern = await Intern.findOne({ isDeleted: false, isActive: true })
        .populate("branch", "branchName name")
        .populate("course", "courseName")
        .populate("batch", "batchName");
    }

    if (!intern) {
      return res.status(404).json({ message: "Intern profile not found." });
    }

    // Resolve Batch Name
    let batchName = "General";
    if (intern.batch && typeof intern.batch === "object" && intern.batch.batchName) {
      batchName = intern.batch.batchName;
    } else if (intern.batch) {
      const bDoc = await Batch.findById(intern.batch).select("batchName");
      if (bDoc) batchName = bDoc.batchName;
    } else {
      const bDoc = await Batch.findOne({ interns: intern._id, isDeleted: false }).select("batchName");
      if (bDoc) batchName = bDoc.batchName;
    }

    // Fetch Mentor Cards for this Intern
    const cards = await MentorCard.find({
      internId: intern._id,
      isDeleted: { $ne: true },
    })
      .populate("mentorId", "fullName email officialEmail")
      .sort({ week: 1, createdAt: 1 });

    // Fetch Attendance records for overall attendance calculation
    const [attendanceRecords, generalRecords] = await Promise.all([
      InternsAttendance.find({ intern: intern._id }),
      Attendance.find({ intern: intern._id }),
    ]);

    let overallAttendancePct = 0;
    const totalCount = attendanceRecords.length + generalRecords.length;
    if (totalCount > 0) {
      const presentFromInterns = attendanceRecords.filter((r) => r.status === true).length;
      const presentFromGeneral = generalRecords.filter((r) => r.status === "PRESENT").length;
      overallAttendancePct = Math.round(((presentFromInterns + presentFromGeneral) / totalCount) * 100);
    }

    // Helper to format date DD/MM/YYYY
    const formatDate = (dt) => {
      if (!dt) return "";
      const d = new Date(dt);
      if (isNaN(d.getTime())) return "";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    let totalTestScores = 0;
    let testCount = 0;
    let totalProjectScores = 0;
    let projectCount = 0;

    const evaluations = cards.map((c) => {
      if (typeof c.test_marks === "number") {
        const total = c.test_total && c.test_total > 0 ? c.test_total : 100;
        const pct = Math.min(100, Math.round((c.test_marks / total) * 100));
        totalTestScores += pct;
        testCount++;
      }

      if (typeof c.project_marks === "number") {
        const total = c.project_total && c.project_total > 0 ? c.project_total : 100;
        const pct = Math.min(100, Math.round((c.project_marks / total) * 100));
        totalProjectScores += pct;
        projectCount++;
      }

      const dateStr =
        c.startDate && c.endDate
          ? `${formatDate(c.startDate)} - ${formatDate(c.endDate)}`
          : c.startDate
          ? formatDate(c.startDate)
          : "-";

      let testDisplay = "-";
      if (typeof c.test_marks === "number") {
        testDisplay = c.test_name
          ? `${c.test_name} (${c.test_marks}/${c.test_total || 100})`
          : `${c.test_marks}/${c.test_total || 100}`;
      } else if (c.test_name) {
        testDisplay = c.test_name;
      }

      let projectDisplay = "-";
      if (typeof c.project_marks === "number") {
        projectDisplay = c.project_name
          ? `${c.project_name} (${c.project_marks}/${c.project_total || 100})`
          : `${c.project_marks}/${c.project_total || 100}`;
      } else if (c.project_name) {
        projectDisplay = c.project_name;
      }

      let softSkillDisplay = "-";
      if (c.isSoftSkill === true) softSkillDisplay = "Pass";
      else if (c.isSoftSkill === false) softSkillDisplay = "Pending";

      let attendanceDisplay = "-";
      if (c.attend) {
        attendanceDisplay = c.totalDays ? `${c.attend}/${c.totalDays} days` : c.attend;
      }

      return {
        id: c._id,
        week: `Week ${c.week || 1}`,
        dates: dateStr,
        subject: c.subject || "-",
        topic: c.topic || "-",
        test: testDisplay,
        project: projectDisplay,
        softSkill: softSkillDisplay,
        attendance: attendanceDisplay,
        mentor: c.mentorId?.fullName || "Mentor",
        notes: c.note || "-",
      };
    });

    const avgTestScore = testCount > 0 ? Math.round(totalTestScores / testCount) : 0;
    const avgProjectScore = projectCount > 0 ? Math.round(totalProjectScores / projectCount) : 0;

    const internProfile = {
      name: (intern.fullName || intern.name || "INTERN").toUpperCase(),
      initial: (intern.fullName || intern.name || "I").charAt(0).toUpperCase(),
      mode: intern.courseStatus ? intern.courseStatus.toUpperCase() : "FULL TIME",
      batch: batchName,
      studentId: intern.admissionNumber || (intern._id ? `STU-${intern._id.toString().slice(-4).toUpperCase()}` : "STU-001"),
      course: intern.course?.courseName || intern.course?.name || "Course",
      avgTestScore,
      avgProjectScore,
      attendance: overallAttendancePct,
    };

    return res.status(200).json({
      intern: internProfile,
      evaluations,
    });
  } catch (error) {
    console.error("Error fetching intern weekly card:", error);
    return res.status(500).json({
      message: "Server error while fetching intern weekly card",
      error: error.message,
    });
  }
};

module.exports = {
  getInternWeeklySchedule,
  getInternWeeklyCard,
};