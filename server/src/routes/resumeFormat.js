const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Resume = require("../models/Resume");
const User = require("../models/Users")
const JobDesc  = require("../models/JobDesc");
const { plainTextResume, markupResume, htmlResume, latexResume, optionsList, allOptions, FormattedContent } = require("../services/formattingService");
const { verifyJWT, extractUserId } = require("../middleware/auth");

// Get an object of all available templates for a specific format
router.get("/options/:format", async (req, res) => {
    const { format } = req.params;
  
    try {
      const response = await optionsList(format);
      res.status(200).json({
        message: `Templates for ${format}`,
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
        const { resumeId } = req.body
        const templateId = req.body.templateId || 'basic'
        let format  = req.body.format || 'bad input'
        let styleId  = req.body.styleId || 'default'
        const userId = req.userId;
        
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

        // Check format
        let response;
        switch(format.toLocaleLowerCase()){
            case "plaintext":
                response = await plainTextResume(resume.content);
                break;
            case "pdf":
            case "latex": // no functionality yet
                response = await latexResume(resume.content);
                break;
            case "html":
                response = await htmlResume(resume.content, templateId, styleId);
                break;
            default: // markup
                format = "markup"
                response = await markupResume(resume.content, templateId);
                break;
        }

        // Populate with User Info 
        const u = await User.findOne({user_id: userId})
        response = response.replace("{{fullName}}", u.name).replace("{{emailAddress}}", u.email)
        if (u.phone) {  // Phone #
            response = response.replace("{{phoneNumber}}", u.phone);
        } else {
            response = response.replace(/{{phoneNumber}}\n?/, "");
        }
        if (u.location){    // location
            response = response.replace("{{location}}", u.location);
        } else {
            response = response.replace(/{{location}}\n?/, "");
        }

        // websites not implemented yet, so remove from template
        response = response.replace(/{{websites}}\n?/, "");
        //console.log("User's websites ", u.websites)

        // Try finding jobTitle
        let jobTitle = resume.jobTitle
        if (!jobTitle){
            const j = await JobDesc.findOne({ _id: resume.jobId, userId: userId})
            jobTitle =  j.job_title || '[Missing Job Title]'
        }
        response = response.replace("{{position}}", jobTitle)

        // Add to DB if it doesn't exist (lifetime of 30 minutes)
        const updatedOrCreatedDoc = await FormattedContent.findOneAndUpdate(
          { user_id: userId, resume_id: resumeId, file: format, lastUsed_styleId: styleId || 'basic', lastUsed_templateId: templateId || 'default' }, // Search filter
          {
            content: response,
            createdAt: new Date(), // Reset TTL timer
          },
          {
            upsert: true, // Insert if not found
            new: true,    // Return the updated document
          }
        );

        // Update original Resume entry with styleID & resumeId
        await Resume.findOneAndUpdate(
          { _id: resumeId, jobId: resume.jobId }, // Search filter
          {
            lastUsed_format: format, 
            lastUsed_styleId: styleId, 
            lastUsed_templateId: templateId,
            last_formattedResumeId: updatedOrCreatedDoc._id,
        })

        console.log("Formatted resume: ", resumeId, " as ", format)
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
