
const express = require("express");
const router = express.Router();

const taskController = require("../Controllers/taskController");
const taskSubmissionController = require("../Controllers/taskSubmissionController");
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

// Task Evaluation routes
router.get(
  "/evaluation/modules",
  taskSubmissionController.getEvaluationModules
);

router.get(
  "/evaluation/tasks",
  taskSubmissionController.getEvaluationTasks
);

router.get(
  "/:taskId/submissions",
  taskSubmissionController.getTaskSubmissions
);

router.put(
  "/submissions/:submissionId/grade",
  taskSubmissionController.gradeSubmission
);


module.exports = router;
