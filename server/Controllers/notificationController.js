
const mongoose = require("mongoose");

const Notification = require("../Models/notificationModel");
const Branch = require("../Models/branchModel");
const Batch = require("../Models/batchModel");
const Category = require("../Models/categoryModel");
const Course = require("../Models/courseModel");
const Intern = require("../Models/internModel");

// =====================================
// HELPER: RESOLVE INTERN RECIPIENTS
// =====================================

const getAudienceInterns = async (data) => {
  const {
    audience,
    branch,
    batches = [],
    courses = [],
    categories = [],
    individualInterns = [],
  } = data;

  let filter = {
    branch: { $in: branch },
    isActive: true,
    isDeleted: false,
  };

  if (audience === "All interns") {
    // All active interns in selected branches
  } else if (audience === "By batches") {
    const selectedBatches = await Batch.find({
      _id: { $in: batches },
      isActive: true,
      isDeleted: false,
    }).select("batchName");

    const batchNames = selectedBatches.map((item) => item.batchName);

    filter.batch = { $in: batchNames };
  } else if (audience === "By Courses") {
    filter.course = { $in: courses };
  } else if (audience === "By Category") {
    const selectedCategories = await Category.find({
      _id: { $in: categories },
      isActive: true,
      isDeleted: false,
    }).select("courses");

    const courseIds = selectedCategories.flatMap((item) => item.courses);

    filter.course = { $in: courseIds };
  } else if (audience === "Individual interns") {
    filter._id = { $in: individualInterns };
  }

  const recipients = await Intern.find(filter).select("_id");

  return recipients.map((intern) => intern._id);
};

// =====================================
// GET ALL NOTIFICATIONS
// =====================================

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      isDeleted: false,
    })
      .populate("branch", "branchName")
      .populate("batches", "batchName")
      .populate("courses", "courseName")
      .populate("categories", "categoryName")
      .populate("individualInterns", "fullName email")
      .populate("interns", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// =====================================
// GET NOTIFICATION BY ID
// =====================================

exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate("branch", "branchName")
      .populate("batches", "batchName")
      .populate("courses", "courseName")
      .populate("categories", "categoryName")
      .populate("individualInterns", "fullName email")
      .populate("interns", "fullName email");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Get Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
      error: error.message,
    });
  }
};

// =====================================
// GET DROPDOWN DATA
// =====================================

exports.getNotificationDropdowns = async (req, res) => {
  try {
    const [branches, batches, categories, courses, interns] =
      await Promise.all([
        Branch.find({ isActive: true, isDeleted: false })
          .select("branchName"),

        Batch.find({ isActive: true, isDeleted: false })
          .populate("branch", "branchName")
          .select("batchName branch"),

        Category.find({ isActive: true, isDeleted: false })
          .populate("branch", "branchName")
          .populate("courses", "courseName")
          .select("categoryName branch courses"),

        Course.find({ isActive: true, isDeleted: false })
          .populate("category", "categoryName")
          .select("courseName category"),

        Intern.find({ isActive: true, isDeleted: false })
          .populate("branch", "branchName")
          .populate("course", "courseName")
          .select("fullName email batch branch course"),
      ]);

    return res.status(200).json({
      success: true,
      branches,
      batches,
      categories,
      courses,
      interns,
      notificationTypes: [
        "Task Notification",
        "Weekly Schedule",
        "Common Notification",
        "Announcement",
        "Reminder",
      ],
      audiences: [
        "All interns",
        "By batches",
        "By Courses",
        "By Category",
        "Individual interns",
      ],
    });
  } catch (error) {
    console.error("Notification Dropdown Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification dropdown data",
      error: error.message,
    });
  }
};

// =====================================
// CREATE NOTIFICATION
// =====================================

exports.createNotification = async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      branch,
      audience,
      batches,
      courses,
      categories,
      individualInterns,
      pushNotification,
    } = req.body;

    const branchIds = Array.isArray(branch) ? branch : branch ? [branch] : [];

    if (!title?.trim() || !content?.trim() || !type || !audience) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, content, type and audience",
      });
    }

    if (!branchIds.length) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one branch",
      });
    }

    const selectedBatches = batches || [];
    const selectedCourses = courses || [];
    const selectedCategories = categories || [];
    const selectedInterns = individualInterns || [];

    if (
      audience === "By batches" && !selectedBatches.length ||
      audience === "By Courses" && !selectedCourses.length ||
      audience === "By Category" && !selectedCategories.length ||
      audience === "Individual interns" && !selectedInterns.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one item for the chosen audience",
      });
    }

    const recipients = await getAudienceInterns({
      audience,
      branch: branchIds,
      batches: selectedBatches,
      courses: selectedCourses,
      categories: selectedCategories,
      individualInterns: selectedInterns,
    });

    const notification = await Notification.create({
      title: title.trim(),
      content: content.trim(),
      type,
      branch: branchIds,
      audience,
      batches: audience === "By batches" ? selectedBatches : [],
      courses: audience === "By Courses" ? selectedCourses : [],
      categories: audience === "By Category" ? selectedCategories : [],
      individualInterns:
        audience === "Individual interns" ? selectedInterns : [],
      interns: recipients,
      pushNotification: pushNotification === true || pushNotification === "true",
    });

    return res.status(201).json({
      success: true,
      message: "Notification published successfully",
      notification,
    });
  } catch (error) {
    console.error("Create Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

// =====================================
// UPDATE NOTIFICATION
// =====================================

exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const existing = await Notification.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const {
      title,
      content,
      type,
      branch,
      audience,
      batches,
      courses,
      categories,
      individualInterns,
      pushNotification,
    } = req.body;

    const branchIds = Array.isArray(branch)
      ? branch
      : branch
        ? [branch]
        : existing.branch;

    const updatedAudience = audience || existing.audience;
    const selectedBatches = batches || [];
    const selectedCourses = courses || [];
    const selectedCategories = categories || [];
    const selectedInterns = individualInterns || [];

    if (!branchIds.length) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one branch",
      });
    }

    if (
      updatedAudience === "By batches" && !selectedBatches.length ||
      updatedAudience === "By Courses" && !selectedCourses.length ||
      updatedAudience === "By Category" && !selectedCategories.length ||
      updatedAudience === "Individual interns" && !selectedInterns.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one item for the chosen audience",
      });
    }

    const recipients = await getAudienceInterns({
      audience: updatedAudience,
      branch: branchIds,
      batches: selectedBatches,
      courses: selectedCourses,
      categories: selectedCategories,
      individualInterns: selectedInterns,
    });

    existing.title = title?.trim() ?? existing.title;
    existing.content = content?.trim() ?? existing.content;
    existing.type = type || existing.type;
    existing.branch = branchIds;
    existing.audience = updatedAudience;
    existing.batches =
      updatedAudience === "By batches" ? selectedBatches : [];
    existing.courses =
      updatedAudience === "By Courses" ? selectedCourses : [];
    existing.categories =
      updatedAudience === "By Category" ? selectedCategories : [];
    existing.individualInterns =
      updatedAudience === "Individual interns" ? selectedInterns : [];
    existing.interns = recipients;

    if (pushNotification !== undefined) {
      existing.pushNotification =
        pushNotification === true || pushNotification === "true";
    }

    await existing.save();

    return res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      notification: existing,
    });
  } catch (error) {
    console.error("Update Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

// =====================================
// PERMANENTLY DELETE NOTIFICATION
// =====================================

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification permanently deleted",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};
