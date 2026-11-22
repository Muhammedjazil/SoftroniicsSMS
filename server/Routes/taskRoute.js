
const express = require("express");
const router = express.Router();

const taskController = require("../Controllers/taskController");
const taskUpload = require("../Middleware/taskUpload");

console.log("TASK ROUTE LOADED:", __filename);
console.log("TASK UPLOAD MIDDLEWARE:", require.resolve("../Middleware/taskUpload"));

// Dropdown data
router.get("/dropdowns", taskController.getTaskDropdowns);

// Get all tasks
router.get("/", taskController.getTasks);

// Create task
router.post(
  "/",
  taskUpload.single("attachments"),
  taskController.createTask
);

// Get task by ID
router.get("/:id", taskController.getTaskById);

// Update task
router.put(
  "/:id",
  taskUpload.single("attachments"),
  taskController.updateTask
);

// Permanently delete task
router.delete("/:id", taskController.deleteTask);

module.exports = router;
