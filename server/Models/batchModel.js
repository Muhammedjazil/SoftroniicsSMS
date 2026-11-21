// models/batchModel.js
const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true, trim: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  status: { type: String, enum: ["Active", "Inactive", "Closed"], default: "Active" },
  days: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "DayCombination",
    default: []
  }],
  totalInterns: { type: Number, default: 0 },
  interns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Intern" }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
      isDeleted: {
    type: Boolean,
    default: false,
  },

  deletedAt: {
    type: Date,
    default: null,
  }   

}, { timestamps: true });

// Update totalInterns automatically
batchSchema.pre("save", function () {
  this.totalInterns = Array.isArray(this.interns) ? this.interns.length : 0;
});


module.exports = mongoose.model("Batch", batchSchema);