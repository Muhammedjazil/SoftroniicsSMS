const express = require("express");
const router = express.Router();

const {
  getLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  deleteLeaveRequest
} = require("../Controllers/leaveRequestController");

router.get("/", getLeaveRequests);
router.get("/:id", getLeaveRequestById);
router.post("/", createLeaveRequest);
router.delete("/:id", deleteLeaveRequest);

module.exports = router;