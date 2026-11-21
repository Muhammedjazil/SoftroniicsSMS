const express = require("express");
const router = express.Router();
const { checkAuth, checkPermission } = require("../Middleware/checkAuth");

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../Controllers/categoryController");

// Create a new category
router.post("/", checkAuth, checkPermission("categoryManagement", "addCategory"), createCategory);

// Get all categories (kept accessible to authenticated users so Course dropdowns work)
router.get("/", checkAuth, getCategories);

// Get a single category by ID
router.get("/:id", checkAuth, checkPermission("categoryManagement", "viewCategory"), getCategoryById);

// Update category
router.put("/:id", checkAuth, checkPermission("categoryManagement", "editCategory"), updateCategory);

// Delete category (soft delete)
router.delete("/:id", checkAuth, checkPermission("categoryManagement", "deleteCategory"), deleteCategory);

module.exports = router;