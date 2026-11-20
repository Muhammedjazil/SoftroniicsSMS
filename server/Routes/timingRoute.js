const express = require("express");
const router = express.Router();
const {
  createTiming,
  getAllTimings,
  updateTiming,
  deleteTiming,
} = require("../Controllers/timingController");

router.post("/", createTiming);
router.get("/", getAllTimings);
router.put("/:id", updateTiming);
router.delete("/:id", deleteTiming);

module.exports = router;