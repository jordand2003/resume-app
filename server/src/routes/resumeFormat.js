const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Resume = require("../models/Resume");
// const FormattingService = require("../services/formattingService")
const { plainTextResume, markupResume, htmlResume, latexResume, optionsList, allOptions, FormattedContent } = require("../services/formattingService");
const { verifyJWT, extractUserId } = require("../middleware/auth");

// Get an object of all available templates for a specific formatType
router.get("/options/:formatType", async (req, res) => {
    const { formatType } = req.params;
  
    try {
      const response = await optionsList(formatType);
      res.status(200).json({
        message: `Templates for ${formatType}`,
        content: response,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch options",
        message: error.message,
      });
    }
});

router.get("/options", async (req, res) => {
    res.status(200).json({
        data: await allOptions()
    });
});

// Generates a formatted resume using a specified template and format type (pdf, plaintext, html, markup)
router.post("/", verifyJWT, extractUserId, async (req, res) => {
    try {
        const { resumeId, formatType, templateId, styleId, user_id } = req.body
        /*
        const resumeId = '6807f29b8d05206b4f804cc0'
        let formatType = 'plaintext'
        const templateId = 'bad input'
        const user_id = '6807e89d111668d948a8ef9b'
        */

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

        // Search for ID 
        const resume = await Resume.findById(resumeId);
        if (!resume) {
          throw new Error("Resume not found");
        }

        // Check formatType
        let response;
        switch(formatType.toLocaleLowerCase()){
            case "plaintext":
                response = await plainTextResume(resume.content);
                break;
            case "pdf":
            case "latex":
                response = await latexResume(resume.content);
                break;
            case "html":
                response = await htmlResume(resume.content, templateId || 'basic');
                break;
            default:    // markup
                formatType = "markup"
                response = await markupResume(resume.content, templateId || 'basic');
                break;
        }

        // Populate with User Info 
        /*
        {{fullName}}
        {{phoneNumber}}
        {{emailAddress}}
        */

        // Add to DB if it doesn't exist (lasts for 30 minutes)
        await FormattedContent.findOneAndUpdate(
            { user_id: user_id, resume_id: resumeId, fileType: formatType }, // Search filter
            {
              content: response,
              createdAt: new Date(), // Reset TTL timer
            },
            {
              upsert: true, // Insert if not found
              new: true,    // Return the updated document
            }
        );

        console.log("Formatted resume: ", resumeId, " as ", formatType)
        res.set('Content-Type', 'text/html');
        res.status(200).send(response);
    }
    catch(error) {
        console.log("Error formatting resume: ", error)
        res.status(500).json({
            error: "Failed to format resume",
            message: error.message,
        })
    }
});


module.exports = router;
