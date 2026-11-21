const express = require("express");
const router = express.Router();
const { checkAuth, checkPermission } = require("../Middleware/checkAuth");
const {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  changeBatchStatus,
  deleteBatch,
  getInternsByBranch,
} = require("../Controllers/batchController");

router.post("/", checkAuth, checkPermission("batchManagement", "addBatch"), createBatch);
router.get("/", checkAuth, checkPermission("batchManagement", "viewBatch"), getAllBatches);
router.get("/interns/:branchId", checkAuth, checkPermission("batchManagement", "viewBatch"), getInternsByBranch);
router.get("/:id", checkAuth, checkPermission("batchManagement", "viewBatch"), getBatchById);
router.put("/:id", checkAuth, checkPermission("batchManagement", "editBatch"), updateBatch);
router.put("/status/:id", checkAuth, checkPermission("batchManagement", "editBatch"), changeBatchStatus);
router.delete("/:id", checkAuth, checkPermission("batchManagement", "deleteBatch"), deleteBatch);

module.exports = router;