
const express = require("express");
const router = express.Router();

const notificationController = require("../Controllers/notificationController");
const { checkAuth } = require("../Middleware/checkAuth");

// Dropdown data
router.get(
  "/dropdowns",
  checkAuth,
  notificationController.getNotificationDropdowns
);

// Get all notifications
router.get(
  "/",
  checkAuth,
  notificationController.getNotifications
);

// Create notification
router.post(
  "/",
  checkAuth,
  notificationController.createNotification
);

router.get("/my-notifications",checkAuth,notificationController.getMyNotifications)

// Get notification by ID
router.get(
  "/:id",
  checkAuth,
  notificationController.getNotificationById
);

// Update notification
router.put(
  "/:id",
  checkAuth,
  notificationController.updateNotification
);

// Permanently delete notification
router.delete(
  "/:id",
  checkAuth,
  notificationController.deleteNotification
);



module.exports = router;
