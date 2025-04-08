const mongoose = require("mongoose");

const JobHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  company: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("JobHistory", JobHistorySchema);
