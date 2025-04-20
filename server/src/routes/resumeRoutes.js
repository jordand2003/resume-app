const express = require("express");
const router = express.Router();
const ResumeService = require("../services/resumeService");
const { verifyJWT, extractUserId } = require("../middleware/auth");
const mongoose = require("mongoose");

// POST /api/resumes/generate
router.post("/generate", verifyJWT, extractUserId, async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        error: "Missing required parameter: jobId (MongoDB _id) is required",
      });
    }

    // Validate that jobId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        error: "Invalid jobId format: must be a valid MongoDB ObjectId",
      });
    }

    const result = await ResumeService.generateResume(jobId, req.userId);

    res.status(202).json({
      message: "Resume generation started",
      resumeId: result.resumeId,
      status: result.status,
    });
  } catch (error) {
    console.error("Resume generation error:", error);
    res.status(500).json({
      error: "Failed to generate resume",
      message: error.message,
    });
  }
});

// GET /api/resumes/status/:resumeId
router.get("/status/:resumeId", verifyJWT, extractUserId, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const status = await ResumeService.getResumeStatus(resumeId);

    res.json(status);
  } catch (error) {
    console.error("Resume status check error:", error);
    res.status(error.message === "Resume not found" ? 404 : 500).json({
      error: error.message,
    });
  }
});

module.exports = router;
