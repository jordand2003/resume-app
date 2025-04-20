const mongoose = require("mongoose");

const JobDescSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  company: { type: String, required: true },
  job_title: { type: String, required: true },
  description: { type: String, required: true }
});

module.exports = mongoose.model("JobDesc", JobDescSchema);