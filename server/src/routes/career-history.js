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
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// POST api for Career History
router.post("/history", async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `Extract structured information from the following resume text. Format the response as a JSON object with the following structure:
{
  "education": [
    {
      "Institute": "university name",
      "Location": "city, state",
      "Degree": "degree name",
      "Major": "field of study",
      "Start_Date": "YYYY",
      "End_Date": "YYYY or Present",
      "GPA": "X.XX",
      "RelevantCoursework": "course1, course2, ...",
      "other": "additional info"
    }
  ],
  "work_experience": [
    {
      "Job_Title": "position title",
      "Company": "company name",
      "Location": "city, state",
      "Start_Date": "YYYY",
      "End_Date": "YYYY or Present",
      "Responsibilities": [
        "responsibility 1",
        "responsibility 2"
      ]
    }
  ]
}

Resume Text:
${text}

Return only valid JSON without any additional text or explanation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let generatedText = response.text();

    // Remove markdown formatting if present
    if (generatedText.startsWith("```")) {
      generatedText = generatedText
        .replace(/^```json\n/, "")
        .replace(/\n```$/, "");
    }

    // Parse the generated text as JSON
    let parsedHistory;
    try {
      parsedHistory = JSON.parse(generatedText);
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      // Use a default structure if parsing fails
      parsedHistory = {
        education: [],
        work_experience: [],
      };
    }

    // Save the structured data
    const savedData = await saveStructuredData(text);

    res.json({
      historyId: "1",
      Status: "Success",
      message: "Career history submitted successfully",
      data: savedData.data || parsedHistory,
    });
  } catch (error) {
    console.error("Submit Free-Form History error:", error);
    res.status(500).json({
      historyId: "-1",
      Status: "Failed",
      message: "Submit Free-Form History failed due to internal error.",
    });
  }
});

// Export for server.js
module.exports = router;
