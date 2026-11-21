
const express = require("express");
const router = express.Router();

const {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} = require("../Controllers/branchController");

// GET all branches
router.get("/", getBranches);

// GET branch by ID
router.get("/:id", getBranchById);

// CREATE branch
router.post("/", createBranch);

// UPDATE branch
router.put("/:id", updateBranch);

// DELETE branch
router.delete("/:id", deleteBranch);

module.exports = router;
