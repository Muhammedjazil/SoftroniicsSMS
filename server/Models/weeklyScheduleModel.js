const mongoose = require("mongoose");

// Ensure referenced models are registered for population
require("./staffModel");
require("./timingModel");
require("./dayCombinationModel");
require("./moduleModel");
require("./branchModel");
require("./batchModel");

const weeklyScheduleSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
  schedule: {
    time: { type: mongoose.Schema.Types.ObjectId, ref: "Timing" },
    sub_details: {
      day: { type: mongoose.Schema.Types.ObjectId, ref: "DayCombination" },
      subject: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
      branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
      batch: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }],
      note: { type: String, trim: true }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("WeeklySchedule", weeklyScheduleSchema);
