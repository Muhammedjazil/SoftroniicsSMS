
// const express = require("express");
// const router = express.Router();

// const taskController = require("../Controllers/taskController");
// const taskSubmissionController = require("../Controllers/taskSubmissionController");
// const taskUpload = require("../Middleware/taskUpload");
// const {checkAuth}=require("../Middleware/checkAuth")

// console.log("TASK ROUTE LOADED:", __filename);
// console.log("TASK UPLOAD MIDDLEWARE:", require.resolve("../Middleware/taskUpload"));

// // Dropdown data
// router.get("/dropdowns", taskController.getTaskDropdowns);

// // Get all tasks
// router.get("/", taskController.getTasks);

// // Create task
// router.post(
//   "/",
//   taskUpload.single("attachments"),
//   taskController.createTask
// );

// // Get task by ID
// router.get("/:id", taskController.getTaskById);

// // Update task
// router.put(
//   "/:id",
//   taskUpload.single("attachments"),
//   taskController.updateTask
// );

// // Permanently delete task
// router.delete("/:id", taskController.deleteTask);

// // Task Evaluation routes
// router.get(
//   "/evaluation/modules",
//   taskSubmissionController.getEvaluationModules
// );

// router.get(
//   "/evaluation/tasks",
//   taskSubmissionController.getEvaluationTasks
// );

// router.get(
//   "/:taskId/submissions",
//   taskSubmissionController.getTaskSubmissions
// );

// router.put(
//   "/submissions/:submissionId/grade",
//   taskSubmissionController.gradeSubmission
// );



// router.get(
//   "/my-tasks",
//   checkAuth,
//   taskController.getMyTasks
// );

// router.get(
//   "/my-submissions",
//   checkAuth,
//   taskController.getMySubmissions
// );


// module.exports = router;



const express = require("express");
const router = express.Router();

const taskController = require("../Controllers/taskController");
const taskSubmissionController = require("../Controllers/taskSubmissionController");
const taskUpload = require("../Middleware/taskUpload");
const { checkAuth } = require("../Middleware/checkAuth");

// =================================
// SPECIFIC ROUTES FIRST
// =================================

// Dropdown data
router.get("/dropdowns", taskController.getTaskDropdowns);

// Intern assigned tasks
router.get(
  "/my-tasks",
  checkAuth,
  taskController.getMyTasks
);

// Intern submissions
router.get(
  "/my-submissions",
  checkAuth,
  taskController.getMySubmissions
);

// Task evaluation
router.get(
  "/evaluation/modules",
  taskSubmissionController.getEvaluationModules
);

router.get(
  "/evaluation/tasks",
  taskSubmissionController.getEvaluationTasks
);

// Get submissions for a particular task
router.get(
  "/:taskId/submissions",
  taskSubmissionController.getTaskSubmissions
);

// Grade submission
router.put(
  "/submissions/:submissionId/grade",
  taskSubmissionController.gradeSubmission
);

// =================================
// GENERAL TASK ROUTES
// =================================

// Get all tasks
router.get("/", taskController.getTasks);

// Create task
router.post(
  "/",
  taskUpload.single("attachments"),
  taskController.createTask
);

// =================================
// DYNAMIC ID ROUTES LAST
// =================================

// Get task by ID
router.get("/:id", taskController.getTaskById);

// Update task
router.put(
  "/:id",
  taskUpload.single("attachments"),
  taskController.updateTask
);

// Delete task
router.delete("/:id", taskController.deleteTask);


// =================================
// INTERN TASK SUBMISSION
// =================================

router.post(
  "/submissions",
  checkAuth,
  taskUpload.single("attachments"),
  taskSubmissionController.createTaskSubmission
);

module.exports = router;
