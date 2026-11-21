
const express = require("express");
const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../Controllers/categoryController");

// Create a new category
router.post("/", createCategory);

// Get all categories
router.get("/", getCategories);

// Get a single category by ID
router.get("/:id", getCategoryById);

// Update category
router.put("/:id", updateCategory);

// Delete category (soft delete)
router.delete("/:id", deleteCategory);

module.exports = router;
