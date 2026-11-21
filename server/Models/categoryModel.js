const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, required: true, trim: true, unique: true },
    totalCourses: { type: Number, default: 0 },
    branch: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
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

categorySchema.pre("save", function () {
  this.totalCourses = Array.isArray(this.courses) ? this.courses.length : 0;
});

module.exports = mongoose.model("Category", categorySchema);