const WeeklySchedule = require("../models/weeklyScheduleModel"); // Adjust path to your WeeklySchedule model
const { Staff } = require("../Models/staffModel");
const Batch = require("../models/batchModel");
const Day = require("../models/dayModel"); // Adjust path to your Day model
const DayCombination = require("../models/dayCombinationModel"); // Adjust path to your DayCombination model
const Module = require("../Models/moduleModel"); // Adjust path to your Module model

// Helper: Normalize 7-day range from startDate string (YYYY-MM-DD)
const getWeekRange = (startDateStr) => {
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// Helper: Find or create a DayCombination ObjectId for a given weekday ("MONDAY" -> "Monday")
const resolveDayCombinationId = async (dayUpper) => {
  const formattedDay =
    dayUpper.charAt(0).toUpperCase() + dayUpper.slice(1).toLowerCase();

  const dayDoc = await Day.findOne({ day: formattedDay, isDeleted: { $ne: true } });
  if (!dayDoc) return null;

  // Prefer an exact single-day DayCombination first
  let combination = await DayCombination.findOne({
    dayCombination: { $size: 1, $all: [dayDoc._id] },
    isDeleted: { $ne: true },
  });

  if (!combination) {
    combination = await DayCombination.create({
      name: dayDoc.name || formattedDay.slice(0, 3).toUpperCase(),
      dayCombination: [dayDoc._id],
      description: `${formattedDay} schedule`,
    });
  }

  return combination._id;
};

// Helper: Extract weekday names ("MONDAY", etc.) from a DayCombination document
const extractUpperDays = (dayCombObj) => {
  if (!dayCombObj || !Array.isArray(dayCombObj.dayCombination)) return [];
  return dayCombObj.dayCombination
    .map((d) => (typeof d === "object" && d !== null && d.day ? d.day.toUpperCase() : null))
    .filter(Boolean);
};

// @desc    Get matrix initialization data + existing schedule cells for week & branch
// @route   GET /weeklyschedule?branchId=...&startDate=YYYY-MM-DD
const getWeeklyScheduleMatrix = async (req, res) => {
  try {
    const { branchId, startDate } = req.query;

    if (!branchId || !startDate) {
      return res.status(400).json({ message: "branchId and startDate are required." });
    }

    const { start, end } = getWeekRange(startDate);

    // 1. Fetch Mentors for the selected branch
    const mentorsRaw = await Staff.find({
      isMentor: true,
      isDeleted: false,
      employmentStatus: "Active",
      $or: [
        { branch: branchId },
        { isMultipleBranch: true, multipleBranches: branchId },
      ],
    })
      .select("fullName branch multipleBranches time")
      .populate({
        path: "time",
        match: { isDeleted: { $ne: true }, isActive: true },
        select: "timeSlot branch",
      })
      .sort({ fullName: 1 });

    // Filter each mentor's slots to the selected branch (or unassigned branch slots)
    const mentors = mentorsRaw.map((m) => {
      const branchSlots = (m.time || []).filter(
        (t) => !t.branch || t.branch.toString() === branchId.toString()
      );
      return {
        _id: m._id,
        name: m.fullName.toUpperCase(),
        slots: branchSlots.map((t) => ({
          _id: t._id,
          timeSlot: t.timeSlot,
        })),
      };
    });

    // 2. Fetch Active Batches for the selected branch
    const batchesRaw = await Batch.find({
      branch: branchId,
      isDeleted: false,
      status: "Active",
    })
      .select("batchName totalInterns interns branch course")
      .populate("branch", "branchName name")
      .populate({ path: "course", select: "courseName", strictPopulate: false })
      .sort({ batchName: 1 });

    const batches = batchesRaw.map((b) => ({
      _id: b._id,
      name: b.batchName,
      course: b.course?.courseName || "N/A",
      interns: b.totalInterns ?? (Array.isArray(b.interns) ? b.interns.length : 0),
      branch: b.branch?.branchName || b.branch?.name || "",
    }));

    // 3. Fetch Available Subjects / Modules
    const modulesRaw = await Module.find({ isDeleted: { $ne: true }, isActive: { $ne: false } })
      .select("moduleName subjectName title name")
      .sort({ createdAt: 1 });

    const subjects = modulesRaw.map((mod) => ({
      _id: mod._id,
      name: mod.moduleName || mod.subjectName || mod.title || mod.name || "Untitled Module",
    }));

    // 4. Fetch WeeklySchedule entries for this branch & week
    const scheduleDocs = await WeeklySchedule.find({
      "schedule.sub_details.branch": branchId,
      startDate: { $lte: end },
      endDate: { $gte: start },
    })
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
      .populate("schedule.sub_details.batch", "batchName");

    // Build cell map keyed by `${mentorId}_${timeId}_${DAY}`
    const scheduleMap = {};

    scheduleDocs.forEach((doc) => {
      const sched = doc.schedule;
      if (!sched || !sched.time) return;

      const mentorId = doc.mentor.toString();
      const timeId = sched.time._id.toString();
      const sub = sched.sub_details || {};
      const upperDays = extractUpperDays(sub.day);

      const firstBatch = Array.isArray(sub.batch) && sub.batch.length > 0 ? sub.batch[0] : null;

      upperDays.forEach((dayUpper) => {
        const cellKey = `${mentorId}_${timeId}_${dayUpper}`;
        scheduleMap[cellKey] = {
          scheduleId: doc._id,
          batchId: firstBatch ? firstBatch._id : null,
          batchName: firstBatch ? firstBatch.batchName : null,
          subjectId: sub.subject ? sub.subject._id : "",
          note: sub.note || "",
        };
      });
    });

    return res.status(200).json({
      mentors,
      batches,
      subjects,
      scheduleMap,
    });
  } catch (error) {
    console.error("Error fetching weekly schedule matrix:", error);
    return res.status(500).json({
      message: "Server error while fetching weekly schedule",
      error: error.message,
    });
  }
};

// @desc    Create or update a single cell in WeeklySchedule
// @route   POST /weeklyschedule/cell
const upsertScheduleCell = async (req, res) => {
  try {
    const {
      startDate,
      branchId,
      mentorId,
      timeId,
      day, // e.g. "MONDAY"
      batchId, // ObjectId or null
      subjectId, // ObjectId or ""
      note,
    } = req.body;

    if (!startDate || !branchId || !mentorId || !timeId || !day) {
      return res.status(400).json({ message: "Missing required cell identifiers." });
    }

    const { start, end } = getWeekRange(startDate);
    const dayCombinationId = await resolveDayCombinationId(day);

    if (!dayCombinationId) {
      return res.status(400).json({ message: `Day record not configured in database for ${day}.` });
    }

    const query = {
      mentor: mentorId,
      startDate: { $lte: end },
      endDate: { $gte: start },
      "schedule.time": timeId,
      "schedule.sub_details.day": dayCombinationId,
      "schedule.sub_details.branch": branchId,
    };

    // If batch, subject, and note are all cleared, remove the empty document
    if (!batchId && !subjectId && (!note || !note.trim())) {
      await WeeklySchedule.findOneAndDelete(query);
      return res.status(200).json({ message: "Cell cleared", deleted: true });
    }

    const updatePayload = {
      startDate: start,
      endDate: end,
      mentor: mentorId,
      schedule: {
        time: timeId,
        sub_details: {
          day: dayCombinationId,
          branch: branchId,
          batch: batchId ? [batchId] : [],
          subject: subjectId || undefined,
          note: note ? note.trim() : "",
        },
      },
    };

    const saved = await WeeklySchedule.findOneAndUpdate(query, updatePayload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    return res.status(200).json({
      message: "Schedule cell saved",
      scheduleId: saved._id,
    });
  } catch (error) {
    console.error("Error upserting schedule cell:", error);
    return res.status(500).json({
      message: "Server error while saving schedule cell",
      error: error.message,
    });
  }
};

// @desc    Clone current week's schedule to next week ("Add Next Schedule")
// @route   POST /weeklyschedule/clone-next
const cloneScheduleToNextWeek = async (req, res) => {
  try {
    const { startDate, branchId } = req.body;
    if (!startDate || !branchId) {
      return res.status(400).json({ message: "startDate and branchId are required." });
    }

    const { start: currStart, end: currEnd } = getWeekRange(startDate);

    const nextStartDt = new Date(currStart);
    nextStartDt.setDate(nextStartDt.getDate() + 7);
    const nextStartStr = nextStartDt.toISOString().split("T")[0];
    const { start: nextStart, end: nextEnd } = getWeekRange(nextStartStr);

    // Check if next week already has entries for this branch
    const existingNextCount = await WeeklySchedule.countDocuments({
      "schedule.sub_details.branch": branchId,
      startDate: { $lte: nextEnd },
      endDate: { $gte: nextStart },
    });

    if (existingNextCount === 0) {
      const currentDocs = await WeeklySchedule.find({
        "schedule.sub_details.branch": branchId,
        startDate: { $lte: currEnd },
        endDate: { $gte: currStart },
      });

      if (currentDocs.length > 0) {
        const clones = currentDocs.map((doc) => ({
          startDate: nextStart,
          endDate: nextEnd,
          mentor: doc.mentor,
          schedule: doc.schedule,
        }));
        await WeeklySchedule.insertMany(clones);
      }
    }

    return res.status(200).json({
      message: "Advanced to next schedule week",
      nextStartDate: nextStartStr,
    });
  } catch (error) {
    console.error("Error cloning schedule to next week:", error);
    return res.status(500).json({
      message: "Server error while advancing schedule week",
      error: error.message,
    });
  }
};

module.exports = {
  getWeeklyScheduleMatrix,
  upsertScheduleCell,
  cloneScheduleToNextWeek,
};