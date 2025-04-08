const mongoose = require("mongoose");

const EducationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Education", EducationSchema);
