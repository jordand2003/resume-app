const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyJWT, extractUserId } = require("../middleware/auth");
const resumeUpload = require("../resumeUpload");
const { saveStructuredData } = require("../services/structuredDataService");
const JobHistory = require("../models/JobHistory");

// Configure multer for file upload
const storage = multer.memoryStorage(); // Store file in memory instead of disk

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and DOCX files are allowed."));
    }
  },
});

// New endpoint for resume upload with text parsing and storage
router.post(
  "/upload",
  verifyJWT,
  extractUserId,
  upload.single("resume"),
  async (req, res) => {
    try {
      console.log("Upload request received:", {
        file: req.file
          ? {
              originalname: req.file.originalname,
              mimetype: req.file.mimetype,
              size: req.file.size,
            }
          : null,
        userId: req.userId,
      });

      if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({
          status: "Failed",
          message: "No file uploaded",
        });
      }

      if (!req.userId) {
        console.log("No userId found in request");
        return res.status(400).json({
          status: "Failed",
          message: "User ID not found",
        });
      }

      console.log("Processing file:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      // Process the resume file
      const result = await resumeUpload(req.file);
      console.log("Resume processing result:", {
        hasData: !!result,
        hasParsedData: result?.parsedData ? true : false,
        hasRawText: result?.rawText ? true : false,
        parsedData: result?.parsedData,
      });

      if (!result || !result.parsedData || !result.rawText) {
        console.log("No result from resume processing");
        return res.status(500).json({
          status: "Failed",
          message: "Failed to process resume",
        });
      }

      // Save the structured data
      console.log(
        "Attempting to save structured data with userId:",
        req.userId
      );
      const savedData = await saveStructuredData(result.rawText, req.userId);
      // console.log("Saved data result:", savedData);

      res.json({
        status: savedData.status,
        message: savedData.message,
        data: savedData,
      });
    } catch (error) {
      console.error("Resume upload error:", error);
      console.error("Error stack:", error.stack);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        code: error.code,
      });
      res.status(500).json({
        status: "Failed",
        message: error.message || "Failed to process resume",
        details: error.stack,
      });
    }
  }
);

// Existing endpoint for backward compatibility
router.post(
  "/file/upload",
  verifyJWT,
  extractUserId,
  upload.single("resume"),
  async (req, res) => {
    try {
      console.log("Upload request received:", {
        file: req.file,
        body: req.body,
        headers: req.headers,
      });

      if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({
          status: "Failed",
          message: "No file uploaded",
        });
      }

      console.log("Processing file:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      const result = await resumeUpload(req.file);
      console.log("Resume processing result:", result);

      if (!result) {
        console.log("No result from resume processing");
        return res.status(500).json({
          status: "Failed",
          message: "Failed to process resume",
        });
      }

      res.json({
        status: "Success",
        message: "Resume processed successfully",
        data: result,
      });
    } catch (error) {
      console.error("Resume upload error:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({
        status: "Failed",
        message: error.message || "Failed to process resume",
      });
    }
  }
);

// Get stored career history
router.get("/history", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    console.log("Fetching career history for user:", userId);

    // Get all job history entries for the user
    const jobHistory = await JobHistory.find({ userId }).sort({
      createdAt: -1,
    });
    console.log("Found job history entries:", jobHistory.length);

    res.json({
      status: "Success",
      message: "Career history retrieved successfully",
      data: jobHistory,
    });
  } catch (error) {
    console.error("Error retrieving career history:", error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to retrieve career history",
      error: error.message,
    });
  }
});

module.exports = router;
