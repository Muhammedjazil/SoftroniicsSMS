
const Category = require("../Models/categoryModel");
const Course = require("../Models/courseModel");
const Branch = require("../Models/branchModel");

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { categoryName, branch } = req.body;

    // Validate category name
    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    // Validate branch
    if (!Array.isArray(branch) || branch.length === 0) {
      return res.status(400).json({
        message: "Please select at least one branch",
      });
    }

    // Check duplicate category
    const existingCategory = await Category.findOne({
      categoryName: categoryName.trim(),
      isDeleted: false,
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    // Check whether branch IDs exist
    const validBranches = await Branch.find({
      _id: { $in: branch },
      isDeleted: false,
    });

    if (validBranches.length !== branch.length) {
      return res.status(400).json({
        message: "One or more selected branches are invalid",
      });
    }

    // Create category
    const category = await Category.create({
      categoryName: categoryName.trim(),
      branch,
      courses: [],
      totalCourses: 0,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });

  } catch (error) {
    console.error("Create Category Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isDeleted: false,
    })
      .populate("branch", "branchName location")
      .populate("courses", "courseName duration courseFee");

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isDeleted: false
    })
      .populate("branch", "branchName location")
      .populate("courses", "courseName duration courseFee");

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.status(200).json(category);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const { categoryName, branch, courses } = req.body;

    const category = await Category.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (categoryName !== undefined) {
      category.categoryName = categoryName;
    }

    if (branch !== undefined) {
      category.branch = branch;
    }

    if (courses !== undefined) {
      const oldCourseIds = category.courses.map(id => id.toString());
      const newCourseIds = courses.map(id => id.toString());

      // Remove this category from courses no longer assigned
      const removedIds = oldCourseIds.filter(
        id => !newCourseIds.includes(id)
      );

      await Course.updateMany(
        { _id: { $in: removedIds }, category: category._id },
        { $unset: { category: "" } }
      );

      // Assign this category to newly selected courses
      await Course.updateMany(
        { _id: { $in: newCourseIds } },
        { $set: { category: category._id } }
      );

      category.courses = courses;
      category.totalCourses = courses.length;
    }

    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// SOFT DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Prevent deleting a category that still has courses
    if (category.courses.length > 0) {
      return res.status(400).json({
        message: "Remove all courses before deleting this category",
      });
    }

    category.isDeleted = true;
    category.isActive = false;
    category.deletedAt = new Date();

    await category.save();

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
