const LeaveRequest = require("../Models/leaveRequestModel");
const Intern = require("../Models/internModel");

// GET ALL LEAVE REQUESTS
const getLeaveRequests = async (req, res) => {
  try {
    const requests = await LeaveRequest.find({
      isDeleted: false
    })
      .populate("branch", "branchName")
      .sort({ appliedAt: -1 })
      .lean();

    const result = await Promise.all(
      requests.map(async request => {
        let intern = null;

        if (request.userModel === "Intern") {
          intern = await Intern.findById(request.user)
            .populate("course", "courseName")
            .populate("batch", "batchName")
            .populate("branch", "branchName")
            .select("fullName email admissionNumber course batch branch")
            .lean();
        }

        return {
          ...request,
          intern,
          internName: intern?.fullName || "",
          admissionNumber: intern?.admissionNumber || "",
          batch: intern?.batch?.batchName || "",
          course: intern?.course?.courseName || "",
          branchName: request.branch?.branchName || "",
          noOfDays: request.totalDays,
          leaveStartDate: request.startDate || request.date,
          leaveEndDate: request.endDate || request.date
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching leave requests",
      error: error.message
    });
  }
};

// GET ONE LEAVE REQUEST
const getLeaveRequestById = async (req, res) => {
  try {
    const request = await LeaveRequest.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate("branch", "branchName");

    if (!request) {
      return res.status(404).json({
        message: "Leave request not found"
      });
    }

    let intern = null;

    if (request.userModel === "Intern") {
      intern = await Intern.findById(request.user)
        .populate("course", "courseName")
        .populate("batch", "batchName")
        .populate("branch", "branchName");
    }

    res.status(200).json({
      ...request.toObject(),
      intern
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching leave request",
      error: error.message
    });
  }
};

// SUBMIT LEAVE REQUEST
const createLeaveRequest = async (req, res) => {
  try {
    const {
      user,
      userModel,
      branch,
      leaveDurationType,
      leaveType,
      date,
      startDate,
      endDate,
      totalDays,
      reason,
      attachments
    } = req.body;

    if (
      !user ||
      !branch ||
      !leaveType ||
      !reason ||
      !totalDays
    ) {
      return res.status(400).json({
        message: "Please provide all required leave details"
      });
    }

    const newRequest = await LeaveRequest.create({
      user,
      userModel: userModel || "Intern",
      branch,
      leaveDurationType: leaveDurationType || "SINGLE",
      leaveType,
      date,
      startDate,
      endDate,
      totalDays,
      reason,
      attachments: attachments || []
    });

    res.status(201).json({
      message: "Leave request submitted successfully",
      data: newRequest
    });
  } catch (error) {
    res.status(500).json({
      message: "Error submitting leave request",
      error: error.message
    });
  }
};

// ================= INTERN: APPLY LEAVE ================= //

const createInternLeaveRequest = async (req, res) => {
  try {
    const internId = req.userId;

    if (!internId) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const intern = await Intern.findOne({
      _id: internId,
      role: "Intern",
      isActive: true,
      isDeleted: false,
    });

    if (!intern) {
      return res.status(404).json({
        message: "Intern not found",
      });
    }

    const {
      leaveDurationType,
      leaveType,
      date,
      startDate,
      endDate,
      reason,
    } = req.body;

    if (!leaveType || !reason?.trim()) {
      return res.status(400).json({
        message: "Please provide leave type and reason",
      });
    }

    let totalDays = 0;
    let leaveData = {};

    if (leaveDurationType === "SINGLE") {
      if (!date) {
        return res.status(400).json({
          message: "Please select leave date",
        });
      }

      const selectedDate = new Date(`${date}T00:00:00.000Z`);

      if (
        Number.isNaN(selectedDate.getTime()) ||
        selectedDate.toISOString().slice(0, 10) !== date
      ) {
        return res.status(400).json({
          message: "Invalid leave date",
        });
      }

      totalDays = 1;

      leaveData.date = selectedDate;
    } else if (leaveDurationType === "MULTIPLE") {
      if (!startDate || !endDate) {
        return res.status(400).json({
          message: "Please select start and end dates",
        });
      }

      const fromDate = new Date(`${startDate}T00:00:00.000Z`);
      const toDate = new Date(`${endDate}T00:00:00.000Z`);

      if (
        Number.isNaN(fromDate.getTime()) ||
        Number.isNaN(toDate.getTime()) ||
        fromDate.toISOString().slice(0, 10) !== startDate ||
        toDate.toISOString().slice(0, 10) !== endDate
      ) {
        return res.status(400).json({
          message: "Invalid leave dates",
        });
      }

      if (toDate < fromDate) {
        return res.status(400).json({
          message: "End date cannot be before start date",
        });
      }

      totalDays =
        Math.floor(
          (toDate.getTime() - fromDate.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      leaveData.startDate = fromDate;
      leaveData.endDate = toDate;
    } else {
      return res.status(400).json({
        message: "Invalid leave duration type",
      });
    }

    const newRequest = await LeaveRequest.create({
  user: intern._id,
  userModel: "Intern",
  branch: intern.branch,
  leaveDurationType,
  leaveType: leaveType.toUpperCase(),
  ...leaveData,
  totalDays,
  reason: reason.trim(),
  status: "PENDING",
});

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      data: newRequest,
    });
  } catch (error) {
    console.error("Intern leave submission error:", error);

    return res.status(500).json({
      message: "Error submitting leave request",
      error: error.message,
    });
  }
};

// ================= INTERN: GET MY LEAVE REQUESTS ================= //

const getMyInternLeaveRequests = async (req, res) => {
  try {
    const internId = req.userId;

    if (!internId) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const intern = await Intern.findOne({
      _id: internId,
      role: "Intern",
      isActive: true,
      isDeleted: false,
    });

    if (!intern) {
      return res.status(404).json({
        message: "Intern not found",
      });
    }

    const requests = await LeaveRequest.find({
      user: intern._id,
      userModel: "Intern",
      isDeleted: false,
    })
      .populate("branch", "branchName")
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      leaveRequests: requests,
    });
  } catch (error) {
    console.error("Get intern leave requests error:", error);

    return res.status(500).json({
      message: "Error fetching leave requests",
      error: error.message,
    });
  }
};
// SOFT DELETE LEAVE REQUEST
const deleteLeaveRequest = async (req, res) => {
  try {
    const request = await LeaveRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false
      },
      {
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        message: "Leave request not found"
      });
    }

    res.status(200).json({
      message: "Leave request deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting leave request",
      error: error.message
    });
  }
};

module.exports = {
  getLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  deleteLeaveRequest,
   
  createInternLeaveRequest,
  getMyInternLeaveRequests,
};