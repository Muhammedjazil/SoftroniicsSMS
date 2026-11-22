const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Task = require("../Models/taskModel");
const Branch = require("../Models/branchModel");
const { Staff } = require("../Models/staffModel");
const Batch = require("../Models/batchModel");
const Course = require("../Models/courseModel");
const Category = require("../Models/categoryModel");
const Intern = require("../Models/internModel");
const Module = require("../Models/moduleModel");

// Convert FormData array strings into arrays
const parseArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [value];
  }
};

// Validate MongoDB ObjectIds
const validateIds = (ids) => {
  return ids.every((id) => mongoose.Types.ObjectId.isValid(id));
};

// Remove uploaded attachment
const removeAttachment = (attachment) => {
  if (!attachment) return;

  const filename = path.basename(attachment);
  const filePath = path.join(__dirname, "../uploads/tasks", filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Populate task details
const populateTask = (query) => {
  return query
    .populate("assignedMentor", "fullName name email")
    .populate("branch", "branchName")
    .populate("batches", "batchName")
    .populate("categories", "categoryName")
    .populate("courses", "courseName")
    .populate("interns", "fullName")
    .populate("individualInterns", "fullName");
};

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      taskType,
      assignedMentor,
      startDate,
      dueDate,
      description,
      totalMarks,
      status,
      audience,
      module
    } = req.body;

    if (
      !title ||
      !taskType ||
      !assignedMentor ||
      !startDate ||
      !dueDate ||
      !description ||
      !audience ||
      !module
    ) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    const branch = parseArray(req.body.branch);
    const batches = parseArray(req.body.batches);
    const categories = parseArray(req.body.categories);
    const courses = parseArray(req.body.courses);
    const interns = parseArray(req.body.interns);
    const individualInterns = parseArray(req.body.individualInterns);

    const allIds = [
      ...branch,
      ...batches,
      ...categories,
      ...courses,
      ...interns,
      ...individualInterns,
      assignedMentor
    ];

    if (!validateIds(allIds)) {
      return res.status(400).json({
        message: "Invalid ID provided"
      });
    }

    const task = await Task.create({
      title,
      taskType,
      assignedMentor,
      startDate,
      dueDate,
      description,
      attachments: req.file
        ? `/uploads/tasks/${req.file.filename}`
        : null,
      totalMarks: totalMarks || 0,
      status: status || "Pending",
      audience,
      branch,
      batches,
      categories,
      courses,
      interns,
      individualInterns,
      module
    });

    const savedTask = await populateTask(
      Task.findById(task._id)
    );

    return res.status(201).json({
      message: "Task created successfully",
      task: savedTask
    });
  } catch (error) {
    if (req.file) {
      removeAttachment(`/uploads/tasks/${req.file.filename}`);
    }

    console.error("Create Task Error:", error);

    return res.status(500).json({
      message: "Failed to create task",
      error: error.message
    });
  }
};

// GET ALL TASKS
exports.getTasks = async (req, res) => {
  try {
    const tasks = await populateTask(
      Task.find().sort({ createdAt: -1 })
    );

    return res.status(200).json({
      message: "Tasks fetched successfully",
      tasks
    });
  } catch (error) {
    console.error("Get Tasks Error:", error);

    return res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message
    });
  }
};

// GET TASK BY ID
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    const task = await populateTask(Task.findById(id));

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    return res.status(200).json({
      message: "Task fetched successfully",
      task
    });
  } catch (error) {
    console.error("Get Task Error:", error);

    return res.status(500).json({
      message: "Failed to fetch task",
      error: error.message
    });
  }
};

// UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const {
      title,
      taskType,
      assignedMentor,
      startDate,
      dueDate,
      description,
      totalMarks,
      status,
      audience,
      module
    } = req.body;

    const branch = parseArray(req.body.branch);
    const batches = parseArray(req.body.batches);
    const categories = parseArray(req.body.categories);
    const courses = parseArray(req.body.courses);
    const interns = parseArray(req.body.interns);
    const individualInterns = parseArray(req.body.individualInterns);

    const allIds = [
      ...branch,
      ...batches,
      ...categories,
      ...courses,
      ...interns,
      ...individualInterns
    ];

    if (assignedMentor) {
      allIds.push(assignedMentor);
    }

    if (!validateIds(allIds)) {
      return res.status(400).json({
        message: "Invalid ID provided"
      });
    }

    if (title !== undefined) task.title = title;
    if (taskType !== undefined) task.taskType = taskType;
    if (assignedMentor !== undefined) {
      task.assignedMentor = assignedMentor;
    }
    if (startDate !== undefined) task.startDate = startDate;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (description !== undefined) task.description = description;
    if (totalMarks !== undefined) task.totalMarks = totalMarks;
    if (status !== undefined) task.status = status;
    if (audience !== undefined) task.audience = audience;
    if (module !== undefined) task.module = module;

    if (req.body.branch !== undefined) task.branch = branch;
    if (req.body.batches !== undefined) task.batches = batches;
    if (req.body.categories !== undefined) task.categories = categories;
    if (req.body.courses !== undefined) task.courses = courses;
    if (req.body.interns !== undefined) task.interns = interns;

    if (req.body.individualInterns !== undefined) {
      task.individualInterns = individualInterns;
    }

    const oldAttachment = task.attachments;

    if (req.file) {
      task.attachments = `/uploads/tasks/${req.file.filename}`;
    }

    await task.save();

    // Delete old attachment only after the database update succeeds
    if (req.file && oldAttachment) {
      removeAttachment(oldAttachment);
    }

    const updatedTask = await populateTask(
      Task.findById(task._id)
    );

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask
    });
  } catch (error) {
    if (req.file) {
      removeAttachment(`/uploads/tasks/${req.file.filename}`);
    }

    console.error("Update Task Error:", error);

    return res.status(500).json({
      message: "Failed to update task",
      error: error.message
    });
  }
};

// PERMANENTLY DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const attachment = task.attachments;

    await Task.findByIdAndDelete(id);

    if (attachment) {
      removeAttachment(attachment);
    }

    return res.status(200).json({
      message: "Task permanently deleted successfully"
    });
  } catch (error) {
    console.error("Delete Task Error:", error);

    return res.status(500).json({
      message: "Failed to delete task",
      error: error.message
    });
  }
};

// GET DROPDOWN DATA
exports.getTaskDropdowns = async (req, res) => {
  try {
    const [
      branches,
      mentors,
      batches,
      categories,
      courses,
      interns,
      modules
    ] = await Promise.all([
      Branch.find({ isActive: true, isDeleted: false })
        .select("branchName"),

      Staff.find({ isActive: true, isDeleted: false })
        .select("fullName name email branch multipleBranches"),

      Batch.find({ isActive: true, isDeleted: false })
        .select("batchName branch"),

      Category.find({ isActive: true, isDeleted: false })
        .select("categoryName branch"),

      Course.find({ isActive: true, isDeleted: false })
        .select("courseName category"),

      Intern.find({ isActive: true, isDeleted: false })
        .select("fullName course branch batch"),

      Module.find({ isActive: true, isDeleted: false })
        .select("moduleName course")
    ]);

    return res.status(200).json({
      message: "Dropdown data fetched successfully",
      branches,
      mentors,
      batches,
      categories,
      courses,
      interns,
      modules
    });
  } catch (error) {
    console.error("Task Dropdown Error:", error);

    return res.status(500).json({
      message: "Failed to fetch dropdown data",
      error: error.message
    });
  }
};