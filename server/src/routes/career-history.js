const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { saveStructuredData } = require("../services/structuredDataService");
const { verifyJWT, extractUserId } = require("../middleware/auth");
require("dotenv").config();

// Define JobHistory Schema
const JobHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  company: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create JobHistory model
const JobHistory = mongoose.model("JobHistory", JobHistorySchema);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// GET api for retrieving stored career history
router.get("/history", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId; // Get userId from Auth0 token

    const jobHistory = await JobHistory.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: "Success",
      message: "Career history retrieved successfully",
      data: jobHistory,
    });
  } catch (error) {
    console.error("Retrieve Career History error:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to retrieve career history",
    });
  }
});

// POST api for Career History
router.post("/history", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    const { text } = req.body;

    console.log("Received career history submission:", {
      userId,
      textLength: text?.length,
    });

    if (!text) {
      console.log("No text provided in request");
      return res.status(400).json({
        status: "Failed",
        message: "Career history text is required",
      });
    }

    let parsedHistory;
    try {
      parsedHistory = JSON.parse(text);
      console.log("Successfully parsed career history:", parsedHistory);
    } catch (error) {
      console.error("Failed to parse career history:", error);
      return res.status(400).json({
        status: "Failed",
        message: "Invalid career history format",
      });
    }

    // Save or update each job entry
    console.log("Processing", parsedHistory.length, "job entries");
    const savedJobs = await Promise.all(
      parsedHistory.map(async (job) => {
        try {
          if (job._id) {
            // Update existing document
            console.log("Updating existing job entry:", job._id);
            const updated = await JobHistory.findByIdAndUpdate(
              job._id,
              {
                company: job.company,
                position: job.position,
                startDate: job.startDate,
                endDate: job.endDate,
                description: job.description,
              },
              { new: true }
            );
            console.log("Updated job entry:", updated._id);
            return updated;
          } else {
            // Create new document
            console.log("Creating new job entry");
            const newJob = new JobHistory({
              userId,
              company: job.company,
              position: job.position,
              startDate: job.startDate,
              endDate: job.endDate,
              description: job.description,
            });
            const saved = await newJob.save();
            console.log("Created new job entry:", saved._id);
            return saved;
          }
        } catch (saveError) {
          console.error("Error processing job entry:", saveError);
          throw saveError;
        }
      })
    );

    console.log("Successfully processed all job entries");
    res.json({
      Status: "Success",
      message: "Career history submitted successfully",
      data: savedJobs,
    });
  } catch (error) {
    console.error("Submit Career History error:", error);
    res.status(500).json({
      Status: "Failed",
      message: "Submit Career History failed due to internal error.",
    });
  }
});

// Export for server.js
module.exports = router;
