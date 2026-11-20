const express = require("express");
const router = express.Router();
const {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  changeBatchStatus,
  deleteBatch,
  getInternsByBranch,
} = require("../Controllers/batchController");

router.post("/", createBatch);
router.get("/", getAllBatches);
router.get("/interns/:branchId", getInternsByBranch);
router.get("/:id", getBatchById);
router.put("/:id", updateBatch);
router.put("/status/:id", changeBatchStatus);
router.delete("/:id", deleteBatch);

module.exports = router;