const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    moduleName: { type: String, required: true, trim: true },
    totalTopics: { type: Number, default: 0 },
    course: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    ],
    topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
    isActive: {
      type: Boolean,
      default: true,
    },
    moduleImage: { type: String },
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

moduleSchema.pre("save", function () {
  this.totalTopics = Array.isArray(this.topics) ? this.topics.length : 0;
});

module.exports = mongoose.model("Module", moduleSchema);