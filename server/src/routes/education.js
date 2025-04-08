const express = require("express");
const router = express.Router();
const { verifyJWT, extractUserId } = require("../middleware/auth");
const Education = require("../models/Education");

// Get education information
router.get("/", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId; // Get userId from Auth0 token
    console.log("Fetching education for user:", userId);

    const education = await Education.find({ userId }).sort({ createdAt: -1 });
    console.log("Found education entries:", education.length);

    res.json({ education });
  } catch (error) {
    console.error("Error getting education information:", error);
    res.status(500).json({ error: "Failed to get education information" });
  }
});

// Submit education information
router.post("/", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId; // Get userId from Auth0 token
    const { education } = req.body;

    console.log("Received education data for user:", userId);
    console.log("Education data:", education);

    // Process each education entry
    const results = await Promise.all(
      education.map(async (edu) => {
        try {
          if (edu._id) {
            // Update existing education entry
            console.log("Updating existing education entry:", edu._id);
            return await Education.findByIdAndUpdate(
              edu._id,
              {
                institution: edu.institution,
                degree: edu.degree,
                field: edu.field,
                startDate: edu.startDate,
                endDate: edu.endDate,
              },
              { new: true }
            );
          } else {
            // Create new education entry
            console.log("Creating new education entry");
            return await Education.create({
              userId,
              institution: edu.institution,
              degree: edu.degree,
              field: edu.field,
              startDate: edu.startDate,
              endDate: edu.endDate,
            });
          }
        } catch (err) {
          console.error("Error processing education entry:", err);
          throw err;
        }
      })
    );

    console.log("Successfully processed education entries");
    res.json({
      message: "Education information saved successfully",
      education: results,
    });
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
