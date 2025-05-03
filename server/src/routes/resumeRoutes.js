const express = require("express");
const router = express.Router();
const ResumeService = require("../services/resumeService");
const { verifyJWT, extractUserId } = require("../middleware/auth");
const mongoose = require("mongoose");
const { FormattedContent } = require("../services/formattingService");

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

// Get all resumes for a user
router.get("/", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    const resumes = await ResumeService.getResumesForUser(userId);
    res.json({ success: true, data: resumes });
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch resumes" });
  }
});

//Get Formatted Resume
router.get("/download/:formattedResumeId", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    const { formattedResumeId } = req.params;
    /* Make sure we have the resume id */
    if (!resumeId) {
      console.error("Where is the resssssumee??");
      res.status(404).json({ message: "No Resume Passed" });
    }

    const resume_content = await FormattedContent.findOne(
      { user_id: userId, resume_id: formattedResumeId }              // Search filter
    );
    
    res.setHeader('Content-Disposition', `attachment; filename="resume"`);
    res.setHeader('Content-Type', resume_content.filetype || 'text/markdown');
    
    res.status(200).send(resume);
  } catch (error) {
    console.error("Error downloading formatted resume:", error);
    res.status(500).json({ message: "Failed to download resume" });
  }
});

module.exports = router;
