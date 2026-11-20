const Module = require("../Models/moduleModel");
const Course = require("../Models/courseModel");
const Topic = require("../Models/topicModel");

// Helper: Normalize course IDs whether sent as JSON array or FormData string
const parseIdArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [value];
    } catch {
      return value.split(",").map((v) => v.trim()).filter(Boolean);
    }
  }
  return [];
};

// @desc    Create a new module & link it to selected courses
// @route   POST /modulemanagement
const createModule = async (req, res) => {
  try {
    const { moduleName } = req.body;
    const courseIds = parseIdArray(req.body.course);

    if (!moduleName || !moduleName.trim() || courseIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Module name and at least one course are required." });
    }

    const formattedName = moduleName.trim().toUpperCase();

    // Prevent duplicate active module with same name
    const existing = await Module.findOne({
      moduleName: formattedName,
      isDeleted: false,
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "A module with this name already exists." });
    }

    const moduleImage =
      req.file?.path || req.file?.filename || req.body.moduleImage || "";

    const newModule = new Module({
      moduleName: formattedName,
      course: courseIds,
      topics: [],
      totalTopics: 0,
      moduleImage,
    });

    const savedModule = await newModule.save();

    // Sync module reference into selected Course documents & update totalModules
    const coursesToUpdate = await Course.find({
      _id: { $in: courseIds },
      isDeleted: false,
    });
    for (const c of coursesToUpdate) {
      if (!c.modules.some((mId) => mId.toString() === savedModule._id.toString())) {
        c.modules.push(savedModule._id);
        await c.save(); // triggers courseSchema pre('save') to update totalModules
      }
    }

    const populatedModule = await Module.findById(savedModule._id)
      .populate("course", "courseName")
      .populate({
        path: "topics",
        match: { isDeleted: false },
        select: "topicName",
      });

    return res.status(201).json({
      message: "Module created successfully",
      data: populatedModule,
    });
  } catch (error) {
    console.error("Error creating module:", error);
    return res.status(500).json({
      message: "Server error while creating module",
      error: error.message,
    });
  }
};

// @desc    Get all non-deleted modules
// @route   GET /modulemanagement
const getAllModules = async (req, res) => {
  try {
    const { course, search } = req.query;
    const filter = { isDeleted: false };

    if (course && course !== "All Courses") {
      filter.course = course;
    }

    if (search && search.trim() !== "") {
      filter.moduleName = { $regex: search.trim(), $options: "i" };
    }

    const modules = await Module.find(filter)
      .populate("course", "courseName")
      .populate({
        path: "topics",
        match: { isDeleted: false },
        select: "topicName",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(modules);
  } catch (error) {
    console.error("Error fetching modules:", error);
    return res.status(500).json({
      message: "Server error while fetching modules",
      error: error.message,
    });
  }
};

// @desc    Get single module by ID
// @route   GET /modulemanagement/:id
const getModuleById = async (req, res) => {
  try {
    const mod = await Module.findOne({ _id: req.params.id, isDeleted: false })
      .populate("course", "courseName")
      .populate({
        path: "topics",
        match: { isDeleted: false },
        select: "topicName",
      });

    if (!mod) {
      return res.status(404).json({ message: "Module not found" });
    }

    return res.status(200).json(mod);
  } catch (error) {
    console.error("Error fetching module:", error);
    return res.status(500).json({
      message: "Server error while fetching module",
      error: error.message,
    });
  }
};

// @desc    Update module details, courses, document, and topics list
// @route   PUT /modulemanagement/:id
const updateModule = async (req, res) => {
  try {
    const { moduleName } = req.body;
    const hasCoursesField = req.body.course !== undefined;
    const newCourseIds = hasCoursesField ? parseIdArray(req.body.course) : null;

    const hasTopicsField = req.body.topics !== undefined;
    const retainedTopicIds = hasTopicsField ? parseIdArray(req.body.topics) : null;

    const mod = await Module.findOne({ _id: req.params.id, isDeleted: false });
    if (!mod) {
      return res.status(404).json({ message: "Module not found" });
    }

    if (moduleName !== undefined && moduleName.trim()) {
      mod.moduleName = moduleName.trim().toUpperCase();
    }

    if (req.file) {
      mod.moduleImage = req.file.path || req.file.filename;
    } else if (req.body.moduleImage !== undefined) {
      mod.moduleImage = req.body.moduleImage;
    }

    // Sync Course additions/removals
    if (hasCoursesField) {
      const oldCourseIds = mod.course.map((id) => id.toString());
      const removedCourseIds = oldCourseIds.filter((id) => !newCourseIds.includes(id));
      const addedCourseIds = newCourseIds.filter((id) => !oldCourseIds.includes(id));

      mod.course = newCourseIds;

      if (removedCourseIds.length > 0) {
        const removedCourses = await Course.find({ _id: { $in: removedCourseIds } });
        for (const c of removedCourses) {
          c.modules = c.modules.filter((mId) => mId.toString() !== mod._id.toString());
          await c.save();
        }
      }

      if (addedCourseIds.length > 0) {
        const addedCourses = await Course.find({ _id: { $in: addedCourseIds } });
        for (const c of addedCourses) {
          if (!c.modules.some((mId) => mId.toString() === mod._id.toString())) {
            c.modules.push(mod._id);
            await c.save();
          }
        }
      }
    }

    // Sync Topic removals from Edit Module form
    if (hasTopicsField) {
      const oldTopicIds = mod.topics.map((id) => id.toString());
      const removedTopicIds = oldTopicIds.filter((id) => !retainedTopicIds.includes(id));

      mod.topics = retainedTopicIds;
      mod.totalTopics = retainedTopicIds.length;

      if (removedTopicIds.length > 0) {
        await Topic.updateMany(
          { _id: { $in: removedTopicIds } },
          { isDeleted: true, isActive: false, deletedAt: new Date() }
        );
      }
    }

    await mod.save(); // triggers moduleSchema pre('save') to update totalTopics

    const updatedModule = await Module.findById(mod._id)
      .populate("course", "courseName")
      .populate({
        path: "topics",
        match: { isDeleted: false },
        select: "topicName",
      });

    return res.status(200).json({
      message: "Module updated successfully",
      data: updatedModule,
    });
  } catch (error) {
    console.error("Error updating module:", error);
    return res.status(500).json({
      message: "Server error while updating module",
      error: error.message,
    });
  }
};

// @desc    Soft delete a module & unlink from courses/topics
// @route   DELETE /modulemanagement/:id
const deleteModule = async (req, res) => {
  try {
    const mod = await Module.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!mod) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Unlink module from Courses
    if (Array.isArray(mod.course) && mod.course.length > 0) {
      const linkedCourses = await Course.find({ _id: { $in: mod.course } });
      for (const c of linkedCourses) {
        c.modules = c.modules.filter((mId) => mId.toString() !== mod._id.toString());
        await c.save();
      }
    }

    // Soft-delete child Topics
    await Topic.updateMany(
      { module: mod._id, isDeleted: false },
      { isDeleted: true, isActive: false, deletedAt: new Date() }
    );

    return res.status(200).json({
      message: "Module deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting module:", error);
    return res.status(500).json({
      message: "Server error while deleting module",
      error: error.message,
    });
  }
};

// @desc    Get all active courses for the Module dropdowns
// @route   GET /modulemanagement/courses
const getCoursesForModules = async (req, res) => {
  try {
    const courses = await Course.find({ isDeleted: false, isActive: true })
      .select("courseName duration courseType")
      .sort({ courseName: 1 });

    return res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      message: "Server error while fetching courses",
      error: error.message,
    });
  }
};

module.exports = {
  createModule,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule,
  getCoursesForModules,
};