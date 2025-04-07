const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { saveStructuredData } = require("../services/structuredDataService");
const { verifyJWT, extractUserId } = require("../middleware/auth");
require("dotenv").config();

// Missing: userid, and save function.
// Userid should be extracted from JWT token, but I don't know how it will be donw
// Save function is Jordan's work

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// GET api for retrieving stored career history
router.get("/history", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId; // Get userId from Auth0 token

    const ResumeData = mongoose.model("ResumeData");
    const userResumes = await ResumeData.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: "Success",
      message: "Career history retrieved successfully",
      data: userResumes.map((resume) => resume.parsedData),
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
    const userId = req.userId; // Get userId from Auth0 token
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        status: "Failed",
        message: "Resume text is required",
      });
    }

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
      parsedHistory = {
        education: [],
        work_experience: [],
      };
    }

    // Save the structured data with userId
    const savedData = await saveStructuredData(text, userId);

    res.json({
      historyId: savedData.data._id || "1",
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
