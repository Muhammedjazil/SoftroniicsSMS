const { Staff } = require("../Models/staffModel"); // Adjust path to your Staff model
const WeeklySchedule = require("../models/weeklyScheduleModel"); // Adjust path to your WeeklySchedule model
const Batch = require("../models/batchModel");

// Helper: Format DayCombination into readable days array & string
const extractDaysInfo = (dayCombObj) => {
  if (!dayCombObj) return { dayNames: [], label: "" };

  const daysArr = Array.isArray(dayCombObj.dayCombination)
    ? dayCombObj.dayCombination
        .map((d) => (typeof d === "object" && d !== null ? d.day : null))
        .filter(Boolean)
    : [];

  const label = daysArr.length > 0 ? daysArr.join(", ") : dayCombObj.name || "";
  return { dayNames: daysArr, label };
};

// @desc    Get all active mentors (optionally filtered by branch)
// @route   GET /mentorbatches/mentors?branchId=...
const getMentors = async (req, res) => {
  try {
    const { branchId } = req.query;

    const filter = {
      isMentor: true,
      isDeleted: false,
      employmentStatus: "Active",
    };

    if (branchId && branchId !== "All Branches") {
      filter.$or = [
        { branch: branchId },
        { isMultipleBranch: true, multipleBranches: branchId },
      ];
    }

    const mentors = await Staff.find(filter)
      .select("fullName email officialEmail branch isMultipleBranch multipleBranches time department")
      .populate("branch", "branchName name")
      .populate("multipleBranches", "branchName name")
      .populate("time", "timeSlot")
      .sort({ fullName: 1 });

    return res.status(200).json(mentors);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return res.status(500).json({ message: "Server error while fetching mentors", error: error.message });
  }
};

// @desc    Get mentor overview, assigned batches, and weekly schedule timeline
// @route   GET /mentorbatches/:mentorId?startDate=YYYY-MM-DD&branchId=...
const getMentorScheduleDetails = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { startDate, branchId } = req.query;

    // 1. Fetch Mentor Profile
    const mentor = await Staff.findOne({ _id: mentorId, isDeleted: false })
      .select("fullName email officialEmail branch isMultipleBranch multipleBranches time")
      .populate("branch", "branchName name")
      .populate("multipleBranches", "branchName name")
      .populate("time", "timeSlot");

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // 2. Build Date Range (7-day window starting from startDate)
    const scheduleFilter = { mentor: mentorId };

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      // Overlap check: schedule starts on or before week end AND ends on or after week start
      scheduleFilter.startDate = { $lte: end };
      scheduleFilter.endDate = { $gte: start };
    }

    if (branchId && branchId !== "All Branches") {
      scheduleFilter["schedule.sub_details.branch"] = branchId;
    }

    // 3. Query WeeklySchedule & Deep Populate
    const schedules = await WeeklySchedule.find(scheduleFilter)
      .populate("schedule.time", "timeSlot")
      .populate({
        path: "schedule.sub_details.day",
        select: "name description dayCombination",
        populate: { path: "dayCombination", select: "name day" },
      })
      .populate({
        path: "schedule.sub_details.subject",
        select: "moduleName subjectName title name",
        strictPopulate: false,
      })
      .populate("schedule.sub_details.branch", "branchName name")
      .populate({
        path: "schedule.sub_details.batch",
        select: "batchName branch status days course totalInterns",
        populate: [
          { path: "branch", select: "branchName name", strictPopulate: false },
          { path: "course", select: "courseName", strictPopulate: false },
          {
            path: "days",
            select: "name dayCombination",
            populate: { path: "dayCombination", select: "name day" },
            strictPopulate: false,
          },
        ],
      });

    // Today's weekday name (e.g., "Friday") for the "Today" pill
    const todayWeekday = new Date().toLocaleDateString("en-US", { weekday: "long" });

    // 4. Group Timeline by Time Slot & Collect Unique Assigned Batches
    const slotMap = new Map();
    const assignedBatchMap = new Map();

    // Seed slotMap with mentor's configured time slots if available
    if (Array.isArray(mentor.time)) {
      mentor.time.forEach((t) => {
        if (t && t.timeSlot && !slotMap.has(t.timeSlot)) {
          slotMap.set(t.timeSlot, {
            slotId: t._id,
            slot: t.timeSlot,
            entries: [],
          });
        }
      });
    }

    schedules.forEach((doc) => {
      const sched = doc.schedule;
      if (!sched) return;

      const slotLabel = sched.time?.timeSlot || "Unassigned Slot";
      const sub = sched.sub_details || {};
      const entryBranchName = sub.branch?.branchName || sub.branch?.name || "";
      const subjectName =
        sub.subject?.moduleName ||
        sub.subject?.subjectName ||
        sub.subject?.title ||
        sub.subject?.name ||
        "";

      const { dayNames, label: daysLabel } = extractDaysInfo(sub.day);
      const displayDays = dayNames.length > 0 ? dayNames : daysLabel ? [daysLabel] : ["UNSCHEDULED"];

      const batchesInSlot = Array.isArray(sub.batch) ? sub.batch : [];

      if (!slotMap.has(slotLabel)) {
        slotMap.set(slotLabel, {
          slotId: sched.time?._id || slotLabel,
          slot: slotLabel,
          entries: [],
        });
      }

      const slotGroup = slotMap.get(slotLabel);

      // Build timeline day entries
      displayDays.forEach((dayName) => {
        const upperDay = dayName.toUpperCase();

        if (batchesInSlot.length === 0) {
          slotGroup.entries.push({
            day: upperDay,
            branch: entryBranchName,
            active: false,
            batchName: "",
            subject: subjectName,
            note: sub.note || "",
          });
        } else {
          batchesInSlot.forEach((b) => {
            const bBranch = b.branch?.branchName || b.branch?.name || entryBranchName;
            slotGroup.entries.push({
              day: upperDay,
              branch: bBranch,
              active: true,
              batchId: b._id,
              batchName: b.batchName,
              subject: subjectName,
              note: sub.note || "",
            });
          });
        }
      });

      // Aggregate unique assigned batches for the left-column card
      batchesInSlot.forEach((b) => {
        if (!b || !b._id) return;
        const bIdStr = b._id.toString();

        // Combine days from schedule entry and batch.days
        const batchDaysSet = new Set(dayNames);
        if (Array.isArray(b.days)) {
          b.days.forEach((dc) => {
            const extracted = extractDaysInfo(dc);
            extracted.dayNames.forEach((dn) => batchDaysSet.add(dn));
          });
        }

        const mergedDays = Array.from(batchDaysSet);
        const existing = assignedBatchMap.get(bIdStr);

        if (existing) {
          mergedDays.forEach((d) => existing.daySet.add(d));
          existing.days = Array.from(existing.daySet).join(", ");
          existing.isToday = existing.daySet.has(todayWeekday);
        } else {
          const daySet = new Set(mergedDays);
          assignedBatchMap.set(bIdStr, {
            id: b._id,
            name: b.batchName,
            daySet,
            days: mergedDays.join(", ") || daysLabel || "Scheduled",
            isToday: daySet.has(todayWeekday),
            branch: b.branch?.branchName || b.branch?.name || entryBranchName,
            course: b.course?.courseName || "COURSE",
          });
        }
      });
    });

    const assignedBatches = Array.from(assignedBatchMap.values()).map(({ daySet, ...rest }) => rest);
    const timeline = Array.from(slotMap.values());

    // Count total active schedule entries
    const totalScheduleSlots = timeline.reduce(
      (acc, grp) => acc + grp.entries.filter((e) => e.active).length,
      0
    );

    return res.status(200).json({
      mentor: {
        id: mentor._id,
        name: mentor.fullName,
        email: mentor.email || mentor.officialEmail,
        primaryBranch: mentor.branch?.branchName || mentor.branch?.name || "N/A",
        multipleBranches: mentor.isMultipleBranch
          ? (mentor.multipleBranches || []).map((mb) => mb.branchName || mb.name)
          : [],
      },
      stats: {
        assignedBatchesCount: assignedBatches.length,
        scheduleSlotsCount: totalScheduleSlots || timeline.length,
      },
      assignedBatches,
      timeline,
    });
  } catch (error) {
    console.error("Error fetching mentor schedule details:", error);
    return res.status(500).json({
      message: "Server error while fetching mentor batches and schedule",
      error: error.message,
    });
  }
};

module.exports = {
  getMentors,
  getMentorScheduleDetails,
};