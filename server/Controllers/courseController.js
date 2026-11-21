
const Course = require("../Models/courseModel");
const Category = require("../Models/categoryModel");

// CREATE COURSE
const createCourse = async (req, res) => {
  try {
    const {
      courseName,
      duration,
      category,
      courseType,
      courseFee,
      description,
      syllabus,
    } = req.body;

    if (
      !courseName ||
      !duration ||
      !category ||
      !courseType ||
      courseFee === undefined ||
      !description
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const categoryExists = await Category.findOne({
      _id: category,
      isDeleted: false,
      isActive: true,
    });

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found or inactive",
      });
    }

    const course = await Course.create({
      courseName,
      duration,
      category,
      courseType,
      courseFee,
      description,
      syllabus,
    });

    categoryExists.courses.push(course._id);
    categoryExists.totalCourses = categoryExists.courses.length;

    await categoryExists.save();

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL COURSES
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      isDeleted: false,
    }).populate("category", "categoryName");

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET COURSE BY ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("category", "categoryName");

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE COURSE
const updateCourse = async (req, res) => {
  try {
    const {
      courseName,
      duration,
      category,
      courseType,
      courseFee,
      description,
      syllabus,
    } = req.body;

    const course = await Course.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (category !== undefined) {
      const categoryExists = await Category.findOne({
        _id: category,
        isDeleted: false,
        isActive: true,
      });

      if (!categoryExists) {
        return res.status(404).json({
          message: "New category not found or inactive",
        });
      }

      if (course.category.toString() !== category) {
        const oldCategory = await Category.findById(course.category);

        if (oldCategory) {
          oldCategory.courses = oldCategory.courses.filter(
            (id) => id.toString() !== course._id.toString()
          );
          oldCategory.totalCourses = oldCategory.courses.length;
          await oldCategory.save();
        }

        if (!categoryExists.courses.some(
          (id) => id.toString() === course._id.toString()
        )) {
          categoryExists.courses.push(course._id);
        }

        categoryExists.totalCourses = categoryExists.courses.length;
        await categoryExists.save();
      }
    }

    course.courseName = courseName ?? course.courseName;
    course.duration = duration ?? course.duration;
    course.category = category ?? course.category;
    course.courseType = courseType ?? course.courseType;
    course.courseFee = courseFee ?? course.courseFee;
    course.description = description ?? course.description;
    course.syllabus = syllabus ?? course.syllabus;

    await course.save();

    res.status(200).json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// SOFT DELETE COURSE
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    course.isDeleted = true;
    course.isActive = false;
    course.deletedAt = new Date();

    await course.save();

    const category = await Category.findById(course.category);

    if (category) {
      category.courses = category.courses.filter(
        (id) => id.toString() !== course._id.toString()
      );

      category.totalCourses = category.courses.length;
      await category.save();
    }

    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
