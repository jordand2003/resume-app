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

/* Get Formatted Resume
  Does not much, calls database and returns the content of the formatted resume

  Front End Example -

  // You may want to use a try statement here to catch the 'no resume found' error
  response = await axios.get(`http://localhost:8000/api/resumes/download/${parameters go here}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  // Create an URL for link tag
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');

  // Add resume details to link tag
  link.href = url;
  link.type = response.headers.get('content-type');
  // Gets filename from content-disposition
  link.download = response.headers.get('content-disposition').match(/filename="?([^"]+)"?/)[1];
  document.body.appendChild(link);

  // Download file
  link.click();

  // Garbage cleanup
  link.remove();
  window.URL.revokeObjectURL(url);
*/
/* single param version
router.get("/download/:formattedResumeId", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    const { formattedResumeId } = req.params;

    // Make sure we have the resume id
    if (!formattedResumeId) {
      console.log("Where is the resssssumee??");
      return res.status(404).json({ message: "No Resume Passed" });
    }

    // Will get the first resume with the same resume_id. Will be modified to get the appropriate resume later
    const resume = await FormattedContent.findOne(
      { user_id: userId, formattedResumeId: formattedResumeId }              // Search filter
    );

    // Nikko will use this to call format again
    if (!resume) {
      console.log("Resume does not exist or expired in collections");
      return res.status(405).json({ message: "Resume not found" });
    }

    var extension;

    // Update this part when adding new types
    switch (resume.file) {
      case "markup":
        res.setHeader('Content-Type', 'text/markup');
        extension = 'md';
        break;
      case "pdf":
        res.setHeader('Content-Type', 'application/pdf');
        extension = 'pdf';
        break;
      case "plaintext":
        res.setHeader('Content-Type', 'text/plain');
        extension = 'txt';
        break;
      default:
        res.setHeader('Content-Type', `text/${resume.file}`);
        extension = resume.file;
    }

    // This one line was very hard to find, it exposes the Content-Disposition header to client
    res.header('Access-Control-Expose-Headers', 'Content-Disposition');
    res.appendHeader('Content-Disposition', `attachment; filename="resume.${extension}"`);

    // Return content only
    return res.status(200).send( resume.content );
  } catch (error) {
    console.error("Error downloading formatted resume:", error);
    return res.status(500).json({ message: "Failed to download resume" });
  }
});
*/

// Multiple parameters version
router.get("/download/:resumeId/:formatType/:styleId/:templateId", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId, formatType, styleId, templateId } = req.params;

    // Make sure we have the resume id
    if (!resumeId) {
      console.log("Where is the resssssumee??");
      return res.status(404).json({ message: "No Resume Passed" });
    }

    // Will get the first resume with the same resume_id. Will be modified to get the appropriate resume later
    const resume = await FormattedContent.findOne(
      { user_id: userId, resume_id: resumeId, file: formatType, lastUsed_styleId: styleId, lastUsed_templateId: templateId }              // Search filter
    );

    // Nikko will use this to call format again
    if (!resume) {
      console.log("Resume does not exist or expired in collections");
      return res.status(405).json({ message: "Resume not found" }); 
    }

    var extension;

    // Update this part when adding new types
    switch (resume.file) {
      case "markup":
        res.setHeader('Content-Type', 'text/markup');
        extension = 'md';
        break;
      case "pdf":
        res.setHeader('Content-Type', 'application/pdf');
        extension = 'pdf';
        break;
      case "plaintext":
        res.setHeader('Content-Type', 'text/plain');
        extension = 'txt';
        break;
      default:
        res.setHeader('Content-Type', `text/${resume.file}`);
        extension = resume.file;
    }

    // This one line was very hard to find, it exposes the Content-Disposition header to client
    res.header('Access-Control-Expose-Headers', 'Content-Disposition');
    res.appendHeader('Content-Disposition', `attachment; filename="resume.${extension}"`);

    // Return content only
    return res.status(200).send( resume.content );
  } catch (error) {
    console.error("Error downloading formatted resume:", error);
    return res.status(500).json({ message: "Failed to download resume" });
  }
});

module.exports = router;
