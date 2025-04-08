const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyJWT, extractUserId } = require("../middleware/auth");
const resumeUpload = require("../resumeUpload");

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

// Upload resume and extract information
router.post(
  "/upload",
  verifyJWT,
  extractUserId,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "Failed",
          message: "No file uploaded",
        });
      }

      const result = await resumeUpload(req.file);

      if (!result) {
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
      res.status(500).json({
        status: "Failed",
        message: error.message || "Failed to process resume",
      });
    }
  }
);

module.exports = router;
