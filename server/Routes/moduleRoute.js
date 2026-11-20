const express = require("express");
const router = express.Router();
const {
  createModule,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule,
  getCoursesForModules,
} = require("../Controllers/moduleController");

router.post("/", createModule);
router.get("/", getAllModules);
router.get("/courses", getCoursesForModules);
router.get("/:id", getModuleById);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);

module.exports = router;