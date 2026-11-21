const express = require("express");
const router = express.Router();
const { checkAuth, checkPermission } = require("../Middleware/checkAuth");

const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../Controllers/courseController");

router.post("/", checkAuth, checkPermission("courseManagement", "addCourse"), createCourse);
router.get("/", checkAuth, getCourses);
router.get("/:id", checkAuth, checkPermission("courseManagement", "viewCourse"), getCourseById);
router.put("/:id", checkAuth, checkPermission("courseManagement", "editCourse"), updateCourse);
router.delete("/:id", checkAuth, checkPermission("courseManagement", "deleteCourse"), deleteCourse);

module.exports = router;