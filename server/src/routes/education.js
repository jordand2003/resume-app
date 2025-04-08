const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middleware/auth");
const { extractEducationInfo } = require("../services/structuredDataService");

// Get education information
router.get("/", verifyJWT, async (req, res) => {
  try {
    const userId = req.user.sub;
    // TODO: Implement database query to get education information
    res.json({ message: "Education information retrieved successfully" });
  } catch (error) {
    console.error("Error getting education information:", error);
    res.status(500).json({ error: "Failed to get education information" });
  }
});

// Submit education information
router.post("/", verifyJWT, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { education } = req.body;

    // TODO: Implement database storage for education information
    res.json({ message: "Education information saved successfully" });
  } catch (error) {
    console.error("Error saving education information:", error);
    res.status(500).json({ error: "Failed to save education information" });
  }
});

// Extract education information from resume
router.post("/extract", verifyJWT, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { resumeText } = req.body;

    const educationInfo = await extractEducationInfo(resumeText);
    res.json(educationInfo);
  } catch (error) {
    console.error("Error extracting education information:", error);
    res.status(500).json({ error: "Failed to extract education information" });
  }
});

module.exports = router;
