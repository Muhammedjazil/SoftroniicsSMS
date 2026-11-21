const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseName: { type: String, required: true, trim: true },
    duration: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    courseType: { type: String, required: true },
    courseFee: { type: Number, required: true },
    totalModules: { type: Number, default: 0 },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
    syllabus: { type: String, default: null },
    description: { type: String, required: true },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

courseSchema.pre("save", function () {
  this.totalModules = Array.isArray(this.modules) ? this.modules.length : 0;
});

module.exports = mongoose.model("Course", courseSchema);