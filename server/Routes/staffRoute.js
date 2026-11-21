const express = require("express");
const router = express.Router();
const upload = require("../Middleware/upload");
const { checkAuth, checkPermission } = require("../Middleware/checkAuth");
const {
  takeroletitle,
  createstaff,
  takeallstaff,
  updatestaff,
  removestaff,
} = require("../Controllers/staffController");

// Used in dropdowns when creating/editing staff
router.get("/", checkAuth, checkPermission("staffManagement", "viewStaff"), takeroletitle);
router.get("/allstaff", checkAuth, checkPermission("staffManagement", "viewStaff"), takeallstaff);

router.post(
  "/",
  checkAuth,
  checkPermission("staffManagement", "addStaff"),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  createstaff
);

router.put(
  "/:id",
  checkAuth,
  checkPermission("staffManagement", "editStaff"),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updatestaff
);

router.delete("/:id", checkAuth, checkPermission("staffManagement", "deleteStaff"), removestaff);

module.exports = router;