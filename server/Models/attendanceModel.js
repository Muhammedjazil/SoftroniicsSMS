const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    intern: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Intern",
      required: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: false
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT"],
      required: true
    }
  },
  { timestamps: true }
);

// One attendance record per intern per day
attendanceSchema.index({ intern: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);