
const express = require("express");
const router = express.Router();

const leaveRequestController = require("../Controllers/leaveRequestController");
const { checkAuth: CheckAuth } = require("../Middleware/checkAuth");

// INTERN ROUTES
router.post(
  "/intern/apply",
  CheckAuth,
  leaveRequestController.createInternLeaveRequest
);

router.get(
  "/intern/my-requests",
  CheckAuth,
  leaveRequestController.getMyInternLeaveRequests
);

// ADMIN ROUTES
router.get(
  "/",
  CheckAuth,
  leaveRequestController.getLeaveRequests
);

router.get(
  "/:id",
  CheckAuth,
  leaveRequestController.getLeaveRequestById
);

router.post(
  "/",
  CheckAuth,
  leaveRequestController.createLeaveRequest
);

router.patch(
  "/:id/status",
  CheckAuth,
  leaveRequestController.updateLeaveRequestStatus
);

router.delete(
  "/:id",
  CheckAuth,
  leaveRequestController.deleteLeaveRequest
);

module.exports = router;