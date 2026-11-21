const express = require("express");
const router = express.Router();
const { checkAuth, checkPermission } = require("../Middleware/checkAuth");
const {
  createModule,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule,
  getCoursesForModules,
} = require("../Controllers/moduleController");

router.post("/", checkAuth, checkPermission("moduleManagement", "addModule"), createModule);
router.get("/", checkAuth, checkPermission("moduleManagement", "viewModule"), getAllModules);
router.get("/courses", checkAuth, checkPermission("moduleManagement", "viewModule"), getCoursesForModules);
router.get("/:id", checkAuth, checkPermission("moduleManagement", "viewModule"), getModuleById);
router.put("/:id", checkAuth, checkPermission("moduleManagement", "editModule"), updateModule);
router.delete("/:id", checkAuth, checkPermission("moduleManagement", "deleteModule"), deleteModule);

module.exports = router;