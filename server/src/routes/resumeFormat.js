const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Resume = require("../models/Resume");
// const FormattingService = require("../services/formattingService")
const { plainTextResume, markupResume, optionsList, FormattedContent } = require("../services/formattingService");
const { verifyJWT, extractUserId } = require("../middleware/auth");

// MISSING DESCRIPTION
router.get("/options", verifyJWT, async (req, res) => {
    const { formatType } = req.body

    const response = optionsList(formatType)

    res.status(200).json({
        message: "Styles & Templates for " + formatType,
        content: response,
    })
})

// MISSING JWT !!!!!!!!! (NOte to self)
router.post("/", /*verifyJWT, extractUserId,*/ async (req, res) => {
    try {
        //const { resumeId, formatType, templateId, styleId, user_id } = req.body
        ///*
        const resumeId = '6807f29b8d05206b4f804cc0'
        let formatType = 'plain-text BAD'
        const styleId = 'bad input'
        const user_id = '6807e89d111668d948a8ef9b'
        //*/

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
            case "plain-text":
                response = await plainTextResume(resume.content);
                break;
            case "pdf":
                // fetch template
                break;
            case "html":
                // fetch template
                response = await htmlResume(resume.content, styleId);
                break;
            default:    // markup
                formatType = "markup"
                response = await markupResume(resume.content, styleId);
                break;
        }

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

        
        // Populate with User Info 
        /*
        {{fullName}}
        {{phoneNumber}}
        {{emailAddress}}
        */

        console.log(response)

        // Response 
        res.status(200).json({
            message: formatType + " FORMATTED",
            resumeID: resumeId,
            content: response,
        })
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
