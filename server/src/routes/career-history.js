const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  saveStructuredData,
  ResumeData,
  CareerHistory
} = require("../services/structuredDataService");
const { verifyJWT, extractUserId } = require("../middleware/auth");
require("dotenv").config();
const mongoose = require("mongoose");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// GET api for retrieving stored career history (v2)
router.get("/history_v2", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    console.log("Fetching career history for user:", userId);

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

    // Gather all jobs with user_id
    const careerHist = await CareerHistory.find({ user_id: userId });

    
    if (!careerHist || careerHist.length === 0) {
      return res.status(200).json({
        status: "Success",
        message: "No career information found",
        data: []
      });
    }

    // Set headers to prevent caching
    res.set("Cache-Control", "no-store");

    res.status(200).json({
      status: "Success",
      message: "Career history retrieved successfully",
      data: careerHist,
    });
  } catch (error) {
    console.error("Retrieve Career History error:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to retrieve career history",
      error: error.message,
    });
  }
});

// GET api for retrieving stored career history (ORIGINAL Version)
router.get("/history", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    console.log("Fetching career history for user:", userId);

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
    console.log("Searching for ResumeData with userId:", userId);
    const resumeData = await ResumeData.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log("Found ResumeData:", resumeData ? "Yes" : "No");
    if (resumeData) {
      console.log("ResumeData _id:", resumeData._id);
      console.log(
        "ResumeData parsedData:",
        JSON.stringify(resumeData.parsedData, null, 2)
      );
    }

    if (!resumeData) {
      console.log("No resume data found for user");
      return res.status(200).json({
        status: "Success",
        message: "No career history available",
        data: [],
      });
    }

    // Extract career history from parsed data
    const careerHistory =
      resumeData.parsedData?.work_experience ||
      resumeData.parsedData?.careerHistory ||
      [];
    console.log("Found career history entries:", careerHistory.length);
    console.log(
      "Career history entries:",
      JSON.stringify(careerHistory, null, 2)
    );

    // Set headers to prevent caching
    res.set("Cache-Control", "no-store");

    res.status(200).json({
      status: "Success",
      message: "Career history retrieved successfully",
      data: careerHistory,
    });
  } catch (error) {
    console.error("Retrieve Career History error:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to retrieve career history",
      error: error.message,
    });
  }
});

// POST api for Career History (Version 2.0)
router.post("/history_v2", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    const { work_experience } = req.body;

    console.log("Received career history submission:", {
      userId,
      work_experience: work_experience,
    });

    if (!work_experience || !Array.isArray(work_experience)) {
      console.log("No education array provided in request");
      return res.status(400).json({
        status: "Failed",
        message: "work_experience data is required and must be an array",
      });
    }

    // Attempt to update job_id if it exists
    const updateDocument = {
      $set: {
        Job_Title: work_experience[0].Job_Title,
        Company: work_experience[0].Company,
        Location: work_experience[0].Location,
        Start_Date: work_experience[0].Start_Date,
        End_Date: work_experience[0].End_Date,
        Responsibilities: work_experience[0].Responsibilities, 
      },
   };

    const result = await CareerHistory.updateOne({ _id: work_experience[0]._id }, updateDocument)
    newEntry = false;         // default response
    responseData = work_experience; // default response

    if(result.matchedCount === 0){ // Add new entry if no update made
      console.log("adding...")
      console.log(work_experience[0])
      const newCareer = new CareerHistory({
        user_id: userId,
        Job_Title: work_experience[0].Job_Title,
        Company: work_experience[0].Company,
        Location: work_experience[0].Location,
        Start_Date: work_experience[0].Start_Date,
        End_Date: work_experience[0].End_Date,
        Responsibilities: work_experience[0].Responsibilities,
      });
      await newCareer.save();
      responseData = newCareer;
      newEntry = true;
    } 

    res.json({
      status: "Success",
      message: "Education entry submitted successfully",
      data: responseData,
      newEntry: newEntry
    });

  } catch (error) {
    console.error("Submit Education error:", error);
    res.status(500).json({
      status: "Failed",
      message: "Submit Education failed due to internal error.",
      error: error.message,
    });
  }
});

// POST api for Career History (ORIGINAL Version)
router.post("/history", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    const { work_experience } = req.body;

    console.log("Received career history submission:", {
      userId,
      work_experience: work_experience,
    });

    if (!work_experience || !Array.isArray(work_experience)) {
      console.log("No work experience array provided in request");
      return res.status(400).json({
        status: "Failed",
        message: "Career history data is required and must be an array",
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

    // Update work experience in parsedData
    resumeData.parsedData.work_experience = work_experience;

    // Save the updated document in resumesData's 'parsedData' section in 'work_experience'
    await resumeData.save();

    console.log("Successfully processed all job entries");
    res.json({
      status: "Success",
      message: "Career history submitted successfully",
      data: resumeData.parsedData.work_experience,
    });
  } catch (error) {
    console.error("Submit Career History error:", error);
    res.status(500).json({
      status: "Failed",
      message: "Submit Career History failed due to internal error.",
      error: error.message,
    });
  }
});

// Delete entry
router.delete("/history_v2", verifyJWT, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.body;

    console.log("Received delete Career request for user:", userId, " w/ Career_id: " + id);

    if (!id) {
      return res.status(400).json({
        status: "Failed",
        message: "Must pass in an _id",
      });
    }

    result = await CareerHistory.findOneAndDelete({ _id: id, userId: userId });  // Delete if job id + userId match
    res.status(200).json({
      status: "Success",
      message: "Sucessfully deleted Career information",
      data: result,
    })
  } catch (error) {
    console.error("Error deleting Career information:", error);
    res.status(500).json({ error: "Failed to delete Career information" });
  }
});

// Export for server.js
module.exports = router;
