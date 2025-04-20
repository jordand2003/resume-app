const express = require("express");
const router = express.Router();
const { verifyJWT, extractUserId } = require("../middleware/auth");
const JobDesc  = require("../models/JobDesc");
const mongoose = require("mongoose");

// Get job listings
router.get("/", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    console.log("Fetching job listings for user:", userId);


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

    // Get all job listings associated with user
    const jobDescData = await JobDesc.find({ userId });
    console.log("Received data:", jobDescData);

    if (!jobDescData) {
      console.log("No job descriptions associated with user");
      return res.status(200).json({
        status: "Success",
        message: "No job listings available",
        data: [],
      });
    }

    // Set headers to prevent caching
    res.set("Cache-Control", "no-store");

    res.status(200).json({
      status: "Success",
      message: "Job descriptions retrieved successfully",
      data: jobDescData,
    });
  } catch (error) {
    console.error("Error getting job descriptions:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to get job descriptions",
      error: error.message,
    });
  }
});

// Submit information
router.post("/", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    const jobDescription = req.body.job_description && req.body.job_description[0]
    const { Job_Title, Company, Description } = jobDescription;
    console.log("Req:", req);
    
    if (!jobDescription || !Job_Title || !Company || !Description) {
      console.log("Received data:", req.body)
      console.log("Missing fields for job listing");
      return res.status(400).json({
        status: "Failed",
        message: "Fill all required fields before submitting",
      });
    }
    const descriptionString = Array.isArray(Description) ? Description.join(" ") : Description;

    const jobDescData = new JobDesc({
        userId,
        company: Company,
        job_title: Job_Title, 
        description: descriptionString,
        contentHash: require("crypto")
          .createHash("sha256")
          .update("initial")
          .digest("hex"),
      });

    console.log(
      "Saving education data:",
      JSON.stringify(jobDescData, null, 2)
    );

    // Save the updated document
    await jobDescData.save();

    console.log("Successfully job listing entries");
    res.json({
      status: "Success",
      message: "Job listing saved successfully",
      data: jobDescData,
    });
  } catch (error) {
    console.error("Error saving job listing:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to save job listing",
      error: error.message,
    });
  }
});

module.exports = router;
