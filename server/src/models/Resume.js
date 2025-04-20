const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "JobListing",
  },
  content: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED"],
    default: "PENDING",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resume", ResumeSchema);
