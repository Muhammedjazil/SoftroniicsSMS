
const mongoose = require("mongoose");

const Intern = require("../Models/internModel");
const Batch = require("../Models/batchModel");
const MonthlyMentorCard = require("../Models/monthlyMentorCardModel");
const Attendance = require("../Models/attendanceModel");

require("../Models/courseModel");
require("../Models/branchModel");
require("../Models/staffModel");

// Find the correct intern using the same approach as Weekly Card
const findIntern = async (req) => {
  const { internId, email } = req.query;

  let intern = null;

  if (internId && mongoose.Types.ObjectId.isValid(internId)) {
    intern = await Intern.findOne({
      _id: internId,
      isDeleted: false,
    });
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
    });
  } else if (
    req.userType === "intern" &&
    req.userId &&
    mongoose.Types.ObjectId.isValid(req.userId)
  ) {
    intern = await Intern.findOne({
      _id: req.userId,
      isDeleted: false,
    });
  }

  if (intern) {
    await intern.populate([
      { path: "branch", select: "branchName name" },
      { path: "course", select: "courseName name" },
      { path: "batch", select: "batchName name" },
    ]);
  }

  return intern;
};

// Convert marks into percentage
const getPercentage = (marks, total) => {
  if (typeof marks !== "number") return null;

  const validTotal =
    typeof total === "number" && total > 0 ? total : 100;

  return Math.min(100, Math.max(0, (marks / validTotal) * 100));
};

// Format month name
const getMonthName = (month) => {
  return new Date(2000, month - 1, 1).toLocaleString("en-US", {
    month: "long",
  });
};

// @desc Get logged-in intern's monthly card
// @route GET /internmonthlycard?internId=...&email=...
const getMyMonthlyCard = async (req, res) => {
  try {
    const intern = await findIntern(req);

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: "Intern profile not found. Check the intern ID or email.",
      });
    }

    // Get monthly evaluation records
    const cards = await MonthlyMentorCard.find({
      internId: intern._id,
      isDeleted: { $ne: true },
    })
      .populate("mentorId", "fullName email officialEmail")
      .sort({ createdAt: 1 });

    // Get attendance records for this intern
    const attendanceRecords = await Attendance.find({
      intern: intern._id,
    }).sort({ date: 1 });

    // Group attendance by calendar year and month
    const attendanceByMonth = {};

    attendanceRecords.forEach((record) => {
      if (!record.date) return;

      const date = new Date(record.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;

      if (!attendanceByMonth[key]) {
        attendanceByMonth[key] = {
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
        };
      }

      attendanceByMonth[key].totalDays += 1;

      if (record.status === "PRESENT") {
        attendanceByMonth[key].presentDays += 1;
      } else if (record.status === "ABSENT") {
        attendanceByMonth[key].absentDays += 1;
      }
    });

    let aptitudeTotal = 0;
    let aptitudeCount = 0;

    let logicalTotal = 0;
    let logicalCount = 0;

    let technicalTotal = 0;
    let technicalCount = 0;

    let communicationTotal = 0;
    let communicationCount = 0;

    const evaluations = cards.map((card) => {
      const aptitudePercentage = getPercentage(
        card.aptitude_marks,
        card.aptitude_total
      );

      const logicalPercentage = getPercentage(
        card.logical_marks,
        card.logical_total
      );

      const technicalPercentage = getPercentage(
        card.technical_marks,
        card.technical_total
      );

      const communicationPercentage = getPercentage(
        card.communication_marks,
        card.communication_total
      );

      if (aptitudePercentage !== null) {
        aptitudeTotal += aptitudePercentage;
        aptitudeCount++;
      }

      if (logicalPercentage !== null) {
        logicalTotal += logicalPercentage;
        logicalCount++;
      }

      if (technicalPercentage !== null) {
        technicalTotal += technicalPercentage;
        technicalCount++;
      }

      if (communicationPercentage !== null) {
        communicationTotal += communicationPercentage;
        communicationCount++;
      }

      // The model has no year field.
      // Use createdAt year to identify the calendar year.
      const year = new Date(card.createdAt).getFullYear();
      const month = Number(card.month);

      const attendanceKey = `${year}-${month}`;
      const monthlyAttendance = attendanceByMonth[attendanceKey] || {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
      };

      const attendancePercentage =
        monthlyAttendance.totalDays > 0
          ? (
              (monthlyAttendance.presentDays /
                monthlyAttendance.totalDays) *
              100
            ).toFixed(2)
          : "0.00";

      // Use card attendance values if supplied;
      // otherwise use the Attendance collection.
      const attendanceText =
        card.attend !== undefined &&
        card.attend !== null &&
        card.attend !== ""
          ? card.totalDays
            ? `${card.attend}/${card.totalDays}`
            : String(card.attend)
          : `${monthlyAttendance.presentDays}/${monthlyAttendance.totalDays}`;

      return {
        id: card._id,
        month,
        monthName: getMonthName(month),
        year,

        aptitude: card.aptitude || "-",
        aptitude_marks: card.aptitude_marks ?? null,
        aptitude_total: card.aptitude_total ?? null,
        aptitudePercentage,

        logical: card.logical || "-",
        logical_marks: card.logical_marks ?? null,
        logical_total: card.logical_total ?? null,
        logicalPercentage,

        technical: card.technical || "-",
        technical_marks: card.technical_marks ?? null,
        technical_total: card.technical_total ?? null,
        technicalPercentage,

        communication: card.communication || "-",
        communication_marks: card.communication_marks ?? null,
        communication_total: card.communication_total ?? null,
        communicationPercentage,

        attend: attendanceText,
        totalDays:
          card.totalDays ?? monthlyAttendance.totalDays,
        presentDays: monthlyAttendance.presentDays,
        absentDays: monthlyAttendance.absentDays,
        attendancePercentage,

        note: card.note || "-",
        mentor: card.mentorId?.fullName || "Mentor",
      };
    });

    const average = (total, count) =>
      count > 0 ? Number((total / count).toFixed(2)) : 0;

    const averages = {
      aptitude: average(aptitudeTotal, aptitudeCount),
      logical: average(logicalTotal, logicalCount),
      technical: average(technicalTotal, technicalCount),
      communication: average(
        communicationTotal,
        communicationCount
      ),
    };

    const totalAttendanceDays = attendanceRecords.length;
    const presentAttendanceDays = attendanceRecords.filter(
      (record) => record.status === "PRESENT"
    ).length;

    const overallAttendance =
      totalAttendanceDays > 0
        ? Number(
            (
              (presentAttendanceDays / totalAttendanceDays) *
              100
            ).toFixed(2)
          )
        : 0;

    const batchName =
      intern.batch?.batchName ||
      intern.batch?.name ||
      "General";

    const student = {
      id: intern._id,
      name: (intern.fullName || intern.name || "INTERN").toUpperCase(),
      initial: (intern.fullName || intern.name || "I")
        .charAt(0)
        .toUpperCase(),
      mode: intern.courseStatus
        ? intern.courseStatus.toUpperCase()
        : "FULL TIME",
      batch: batchName,
      studentId:
        intern.admissionNumber ||
        `STU-${intern._id.toString().slice(-4).toUpperCase()}`,
      course:
        intern.course?.courseName ||
        intern.course?.name ||
        "Course",
      branch:
        intern.branch?.branchName ||
        intern.branch?.name ||
        "-",
    };

    return res.status(200).json({
      success: true,
      student,
      averages,
      attendance: overallAttendance,
      evaluations,
    });
  } catch (error) {
    console.error("Get My Monthly Card Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly card",
      error: error.message,
    });
  }
};

// @desc Get interns for monthly card management
// @route GET /internmonthlycard/interns
const getInternsForMonthlyCard = async (req, res) => {
  try {
    const interns = await Intern.find({
      isDeleted: false,
      isActive: true,
    })
      .populate("batch", "batchName")
      .populate("course", "courseName")
      .select("fullName email officialEmail admissionNumber batch course");

    return res.status(200).json({
      success: true,
      interns,
    });
  } catch (error) {
    console.error("Get Monthly Card Interns Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch interns",
      error: error.message,
    });
  }
};

// @desc Get monthly cards for a particular intern
// @route GET /internmonthlycard/intern/:internId
const getMonthlyCardsByIntern = async (req, res) => {
  try {
    const { internId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(internId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid intern ID",
      });
    }

    const cards = await MonthlyMentorCard.find({
      internId,
      isDeleted: { $ne: true },
    })
      .populate("internId", "fullName email admissionNumber")
      .populate("mentorId", "fullName email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      evaluations: cards,
    });
  } catch (error) {
    console.error("Get Monthly Cards By Intern Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly evaluations",
      error: error.message,
    });
  }
};

// @desc Create or update a monthly evaluation
// @route POST /internmonthlycard
const createOrUpdateMonthlyCard = async (req, res) => {
  try {
    const {
      internId,
      month,
      mentorId,
    } = req.body;

    if (
      !internId ||
      !mongoose.Types.ObjectId.isValid(internId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid intern ID is required",
      });
    }

    if (!month || Number(month) < 1 || Number(month) > 12) {
      return res.status(400).json({
        success: false,
        message: "Month must be a number from 1 to 12",
      });
    }

    const internExists = await Intern.findOne({
      _id: internId,
      isDeleted: false,
    });

    if (!internExists) {
      return res.status(404).json({
        success: false,
        message: "Intern not found",
      });
    }

    const filter = {
      internId,
      month: Number(month),
      mentorId: mentorId || null,
    };

    const updateData = {
      ...req.body,
      month: Number(month),
      isDeleted: false,
      deletedAt: null,
    };

    delete updateData._id;

    const card = await MonthlyMentorCard.findOneAndUpdate(
      filter,
      { $set: updateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    )
      .populate("internId", "fullName email admissionNumber")
      .populate("mentorId", "fullName email");

    return res.status(200).json({
      success: true,
      message: "Monthly evaluation saved successfully",
      card,
    });
  } catch (error) {
    console.error("Save Monthly Card Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save monthly evaluation",
      error: error.message,
    });
  }
};

// @desc Soft delete a monthly evaluation
// @route DELETE /internmonthlycard/:id
const deleteMonthlyCard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid monthly card ID",
      });
    }

    const card = await MonthlyMentorCard.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Monthly card not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Monthly card deleted successfully",
    });
  } catch (error) {
    console.error("Delete Monthly Card Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete monthly card",
      error: error.message,
    });
  }
};

module.exports = {
  getMyMonthlyCard,
  getInternsForMonthlyCard,
  getMonthlyCardsByIntern,
  createOrUpdateMonthlyCard,
  deleteMonthlyCard,
};
