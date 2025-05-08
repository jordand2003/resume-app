const express = require("express");
const router = express.Router();
const { verifyJWT, extractUserId } = require("../middleware/auth");
const JobAdviceService = require("../services/jobAdviceService");
const mongoose = require("mongoose");

// POST /api/jobs/advice
router.post("/advice", verifyJWT, extractUserId, async (req, res) => {
  try {
    const { jobId, resumeId } = req.body;

    // Validate required parameters
    if (!jobId || !resumeId) {
      return res.status(400).json({
        status: "Failed",
        message: "Both jobId and resumeId are required",
      });
    }

    // Validate MongoDB ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(jobId) ||
      !mongoose.Types.ObjectId.isValid(resumeId)
    ) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid jobId or resumeId format",
      });
    }

    // Generate advice
    const advice = await JobAdviceService.generateAdvice(jobId, resumeId);

    res.status(200).json({
      status: "Success",
      message: "Job advice generated successfully",
      data: advice,
    });
  } catch (error) {
    console.error("Error generating job advice:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to generate job advice",
      error: error.message,
    });
  }
});

module.exports = router;
