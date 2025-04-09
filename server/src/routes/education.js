const express = require("express");
const router = express.Router();
const { verifyJWT, extractUserId } = require("../middleware/auth");
const { ResumeData } = require("../services/structuredDataService");
const mongoose = require("mongoose");

// Get education information
router.get("/", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    console.log("Fetching education for user:", userId);

    // Check MongoDB connection
    const connectionState = mongoose.connection.readyState;
    console.log("MongoDB connection state:", connectionState);
    if (connectionState !== 1) {
      console.error("MongoDB is not connected. State:", connectionState);
      return res.status(500).json({
        status: "Failed",
        message: "Database connection error",
      });
    }

    // Get the most recent resume data
    const resumeData = await ResumeData.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!resumeData) {
      console.log("No resume data found for user");
      return res.status(200).json({
        status: "Success",
        message: "No education information available",
        data: [],
      });
    }

    // Extract education from parsed data
    const education = resumeData.parsedData?.education || [];
    console.log("Found education entries:", education.length);
    console.log("Education entries:", JSON.stringify(education, null, 2));

    // Set headers to prevent caching
    res.set("Cache-Control", "no-store");

    res.status(200).json({
      status: "Success",
      message: "Education information retrieved successfully",
      data: education,
    });
  } catch (error) {
    console.error("Error getting education information:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to get education information",
      error: error.message,
    });
  }
});

// Submit education information
router.post("/", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    const { education } = req.body;

    console.log("Received education data for user:", userId);
    console.log("Education data:", JSON.stringify(education, null, 2));

    if (!education || !Array.isArray(education)) {
      console.log("No education array provided in request");
      return res.status(400).json({
        status: "Failed",
        message: "Education data is required and must be an array",
      });
    }

    // Get the most recent resume data or create new one
    let resumeData = await ResumeData.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!resumeData) {
      // Create new ResumeData document if none exists
      resumeData = new ResumeData({
        userId,
        rawContent: "",
        parsedData: {
          work_experience: [],
          education: [],
          skills: [],
          summary: "",
        },
        contentHash: require("crypto")
          .createHash("sha256")
          .update("initial")
          .digest("hex"),
      });
    }

    // Update education in parsedData with consistent field names
    resumeData.parsedData.education = education.map((edu) => ({
      Institute: edu.Institute || edu.institution,
      Degree: edu.Degree || edu.degree,
      Major: edu.Major || edu.field,
      GPA: edu.gpa || edu.GPA,
      Start_Date: edu.Start_Date || edu.startDate,
      End_Date: edu.End_Date || edu.endDate,
    }));

    console.log(
      "Saving education data:",
      JSON.stringify(resumeData.parsedData.education, null, 2)
    );

    // Save the updated document
    await resumeData.save();

    console.log("Successfully processed education entries");
    res.json({
      status: "Success",
      message: "Education information saved successfully",
      data: resumeData.parsedData.education,
    });
  } catch (error) {
    console.error("Error saving education information:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to save education information",
      error: error.message,
    });
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
