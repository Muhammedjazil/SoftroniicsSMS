
const mongoose = require("mongoose");

const Task = require("../Models/taskModel");
const TaskSubmission = require("../Models/taskSubmissionModel");

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
