const express = require("express");
const router = express.Router();
const { checkAuth, checkPermission } = require("../Middleware/checkAuth");
const {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} = require("../Controllers/branchController");

// Keep GET / accessible to any authenticated staff/admin so dropdowns (Staff, Batch, Schedule) work
router.get("/", checkAuth, getBranches);
router.get("/:id", checkAuth, checkPermission("branchManagement", "viewBranch"), getBranchById);
router.post("/", checkAuth, checkPermission("branchManagement", "addBranch"), createBranch);
router.put("/:id", checkAuth, checkPermission("branchManagement", "editBranch"), updateBranch);
router.delete("/:id", checkAuth, checkPermission("branchManagement", "deleteBranch"), deleteBranch);

module.exports = router;