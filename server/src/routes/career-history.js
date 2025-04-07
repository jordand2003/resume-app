const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { saveStructuredData } = require("../services/structuredDataService");
require("dotenv").config();

// Missing: userid, and save function.
// Userid should be extracted from JWT token, but I don't know how it will be donw
// Save function is Jordan's work

// Template GET api for Retreive Stored Career History
router.get("/history", async (req, res) => {
  try {
    const db = mongoose.connection.useDb("Career", {
      // `useCache` tells Mongoose to cache connections by database name, so
      // `mongoose.connection.useDb('foo', { useCache: true })` returns the
      // same reference each time.
      useCache: true,
    });
    const { userid } = req.params;
    const cursor = db.find({ userid: userid });
    res.status(200).json({
      message: "",
    });
  } catch (error) {
    console.error("Retreive Career History error:", error);
    res.status(500).json({
      message: "Retrieve Stored Career History failed",
    });
  }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// POST api for Career History
router.post("/history", async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `Extract career history from the following text and format it as JSON with work experience entries. Each entry should have: Title, Company, Location, Start Date, End Date, and Responsibilities (as an array). Here's the text to analyze:

${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    // Parse the generated text as JSON
    let parsedHistory;
    try {
      parsedHistory = JSON.parse(generatedText);
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", error);
      parsedHistory = { work_experience: [] };
    }

    // Save the structured data using our service
    const savedResult = await saveStructuredData(text);

    res.status(200).json({
      historyId: savedResult.data._id,
      Status: "Saved",
      data: savedResult.data,
    });
  } catch (error) {
    console.error("Submit Free-Form History error:", error);
    if (error === "Insufficient Data")
      res.status(400).json({
        historyId: "-1",
        Status: "Failed",
        message: "Invalid Career History given. Try again.",
      });
    else
      res.status(500).json({
        historyId: "-1",
        Status: "Failed",
        message: "Submit Free-Form History failed due to internal error.",
      });
  }
});

// Export for server.js
module.exports = router;
