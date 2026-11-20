const mongoose = require("mongoose");
const Batch = require("../Models/batchModel");
const InternModel = require("../Models/internModel");
const WeeklySchedule = require("../Models/weeklyScheduleModel");

// Helper: Normalize 7-day range from startDate string (YYYY-MM-DD)
const getWeekRange = (startDateStr) => {
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// Helper: Extract weekday names ("MONDAY", etc.) from DayCombination
const extractUpperDays = (dayCombObj) => {
  if (!dayCombObj || !Array.isArray(dayCombObj.dayCombination)) return [];
  return dayCombObj.dayCombination
    .map((d) => (typeof d === "object" && d !== null && d.day ? d.day.toUpperCase() : null))
    .filter(Boolean);
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
      const normalizedEmail = email.trim().toLowerCase();
      intern = await Intern.findOne({
        $or: [{ email: normalizedEmail }, { officialEmail: normalizedEmail }],
        isDeleted: false,
      })
        .populate("branch", "branchName name")
        .populate("course", "courseName");
    } else {
      // Fallback for dev preview if auth user isn't passed yet
      intern = await Intern.findOne({ isDeleted: false, isActive: true })
        .populate("branch", "branchName name")
        .populate("course", "courseName");
    }

    if (!intern) {
      return res.status(404).json({ message: "Intern profile not found." });
    }

    // 2. Find all Batches belonging to this Intern
    const batchOrConditions = [{ interns: intern._id }];

    if (intern.batch && intern.batch.trim()) {
      if (mongoose.Types.ObjectId.isValid(intern.batch.trim())) {
        batchOrConditions.push({ _id: intern.batch.trim() });
      } else {
        batchOrConditions.push({
          batchName: {
            $regex: `^${intern.batch.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
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

    // Build normalized myBatches array
    const myBatches =
      batches.length > 0
        ? batches.map((b) => ({
            id: b._id,
            name: b.batchName,
            branch: b.branch?.branchName || b.branch?.name || internBranchName,
          }))
        : intern.batch
        ? [{ id: "assigned", name: intern.batch, branch: internBranchName }]
        : [];

    const batchIds = batches.map((b) => b._id);

    // 3. Query WeeklySchedule for those batch IDs within the selected 7-day range
    let weeklySlots = [];

    if (batchIds.length > 0) {
      const scheduleFilter = {
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
          populate: { path: "dayCombination", select: "name day" },
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

      weeklySlots.sort((a, b) => a.dayOrder - b.dayOrder);
    }

    return res.status(200).json({
      intern: {
        id: intern._id,
        name: intern.fullName.toUpperCase(),
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

module.exports = {
  getInternWeeklySchedule,
};