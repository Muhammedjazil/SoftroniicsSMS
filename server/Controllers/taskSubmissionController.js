
const mongoose = require("mongoose");

const Task = require("../Models/taskModel");
const TaskSubmission = require("../Models/taskSubmissionModel");

const Intern = require("../Models/internModel");

// GET MODULE NAMES FROM EXISTING TASKS
exports.getEvaluationModules = async (req, res) => {
  try {
    const modules = await Task.distinct("module", {
      isActive: true,
      isDeleted: false
    });

    return res.status(200).json({
      message: "Modules fetched successfully",
      modules: modules.filter(Boolean).sort()
    });
  } catch (error) {
    console.error("Evaluation Modules Error:", error);

    return res.status(500).json({
      message: "Failed to fetch modules",
      error: error.message
    });
  }
};

// GET TASKS, OPTIONALLY FILTERED BY MODULE
exports.getEvaluationTasks = async (req, res) => {
  try {
    const { module } = req.query;

    const filter = {
      isActive: true,
      isDeleted: false
    };

    if (module && module !== "all") {
      filter.module = module;
    }

    const tasks = await Task.find(filter)
      .select("title module totalMarks dueDate status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Evaluation tasks fetched successfully",
      tasks
    });
  } catch (error) {
    console.error("Evaluation Tasks Error:", error);

    return res.status(500).json({
      message: "Failed to fetch evaluation tasks",
      error: error.message
    });
  }
};

// GET SUBMISSIONS FOR A SELECTED TASK
exports.getTaskSubmissions = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    const task = await Task.findOne({
      _id: taskId,
      isDeleted: false
    }).select("title module totalMarks");

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const submissions = await TaskSubmission.find({
      task: taskId,
      isDeleted: false
    })
      .populate(
        "intern",
        "fullName admissionNumber email officialEmail"
      )
      .populate("gradedBy", "fullName name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Submissions fetched successfully",
      task,
      submissions
    });
  } catch (error) {
    console.error("Task Submissions Error:", error);

    return res.status(500).json({
      message: "Failed to fetch submissions",
      error: error.message
    });
  }
};

// GRADE OR REJECT A SUBMISSION
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { achievedMarks, feedback, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({
        message: "Invalid submission ID"
      });
    }

    if (!["Graded", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Graded or Rejected"
      });
    }

    const submission = await TaskSubmission.findOne({
      _id: submissionId,
      isDeleted: false
    });

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found"
      });
    }

    const task = await Task.findById(submission.task);

    if (!task) {
      return res.status(404).json({
        message: "Related task not found"
      });
    }

    const marks = Number(achievedMarks);

    if (
      status === "Graded" &&
      (!Number.isFinite(marks) ||
        marks < 0 ||
        marks > task.totalMarks)
    ) {
      return res.status(400).json({
        message: `Marks must be between 0 and ${task.totalMarks}`
      });
    }

    submission.achievedMarks =
      status === "Graded" ? marks : 0;

    submission.feedback = feedback || "";
    submission.status = status;
    submission.gradedAt = new Date();

    // Supports common authentication middleware user properties.
    submission.gradedBy =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId ||
      null;

    await submission.save();

    const updatedSubmission = await TaskSubmission.findById(
      submission._id
    )
      .populate(
        "intern",
        "fullName admissionNumber email officialEmail"
      )
      .populate("gradedBy", "fullName name email");

    return res.status(200).json({
      message: "Submission evaluated successfully",
      submission: updatedSubmission
    });
  } catch (error) {
    console.error("Grade Submission Error:", error);

    return res.status(500).json({
      message: "Failed to evaluate submission",
      error: error.message
    });
  }
};


// ======================================
// INTERN SUBMIT TASK
// ======================================

exports.createTaskSubmission = async (req, res) => {
  try {
    // 1. Check authentication
    if (req.userType !== "intern") {
      return res.status(403).json({
        message: "Only interns can submit tasks"
      });
    }

    const internId = req.userId;

    // 2. Get form data
    const {
      task,
      submissionText,
      githubRepository,
      liveDemoUrl
    } = req.body;

    if (!task || !mongoose.Types.ObjectId.isValid(task)) {
      return res.status(400).json({
        message: "Valid task ID is required"
      });
    }

    if (!submissionText || !submissionText.trim()) {
      return res.status(400).json({
        message: "Submission description is required"
      });
    }

    // 3. Find logged-in intern
    const intern = await Intern.findOne({
      _id: internId,
      isActive: true,
      isDeleted: false
    })
      .populate({
        path: "course",
        select: "courseName category"
      });

    if (!intern) {
      return res.status(404).json({
        message: "Intern not found"
      });
    }

    // 4. Check whether the task is assigned to this intern
    const audienceConditions = [
      { audience: "All interns" },

      ...(intern.batch
        ? [{
            audience: "By batches",
            batches: intern.batch
          }]
        : []),

      ...(intern.course
        ? [{
            audience: "By Courses",
            courses: intern.course._id
          }]
        : []),

      ...(intern.course?.category
        ? [{
            audience: "By Category",
            categories: intern.course.category
          }]
        : []),

      {
        audience: "Individual interns",
        individualInterns: intern._id
      }
    ];

    const assignedTask = await Task.findOne({
      _id: task,
      isActive: true,
      isDeleted: false,
      branch: intern.branch,
      $or: audienceConditions
    });

    if (!assignedTask) {
      return res.status(404).json({
        message: "Task not found or not assigned to you"
      });
    }

    // 5. Prevent duplicate submissions
    const existingSubmission = await TaskSubmission.findOne({
      task: task,
      intern: intern._id,
      isDeleted: false
    });

    if (existingSubmission) {
      return res.status(400).json({
        message: "You have already submitted this task"
      });
    }

    // 6. Get uploaded attachment
    const attachments = req.file
      ? [`/uploads/tasks/${req.file.filename}`]
      : [];

    // 7. Save submission in MongoDB
    const newSubmission = await TaskSubmission.create({
      task: assignedTask._id,
      intern: intern._id,
      submissionText: submissionText.trim(),
      githubRepository: githubRepository || "",
      liveDemoUrl: liveDemoUrl || "",
      attachments,
      status: "Submitted"
    });

    // 8. Return saved submission
    const savedSubmission = await TaskSubmission.findById(
      newSubmission._id
    )
      .populate("task", "title taskType module totalMarks dueDate")
      .populate("intern", "fullName email")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Task submitted successfully!",
      submission: savedSubmission
    });

  } catch (error) {
    console.error("Create Task Submission Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit task",
      error: error.message
    });
  }
};