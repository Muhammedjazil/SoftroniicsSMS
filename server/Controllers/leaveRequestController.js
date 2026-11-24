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
  deleteLeaveRequest
};