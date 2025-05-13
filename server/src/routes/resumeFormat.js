const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Resume = require("../models/Resume");
const User = require("../models/Users")
const JobDesc  = require("../models/JobDesc");
const { plainTextResume, markupResume, htmlResume, latexResume, optionsList, allOptions, FormattedContent } = require("../services/formattingService");
const { verifyJWT, extractUserId } = require("../middleware/auth");
const { SkillList } = require("../services/structuredDataService");

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
        var { resumeId, formatType, templateId, styleId } = req.body
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
        const skillList = await SkillList.findOne({ user_id: userId });
        if (skillList) {
          resume.content.skills = skillList.skills
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
        const u = await User.findOne({user_id: userId})
        response = response.replace("{{fullName}}", u.name).replace("{{emailAddress}}", u.email)
        if (u.phone) {  // Phone #
            response = response.replace("{{phoneNumber}}", u.phone);
        } else {
            response = response.replace(/{{phoneNumber}}\s*(\|\s*)?(\n)?/, "");
        }
        if (u.location){    // location
            response = response.replace("{{location}}", u.location);
        } else {
            response = response.replace(/{{location}}\s*(\|\s*)?(\n)?/, "");
        }

        // websites not implemented yet, so remove from template
        response = response.replace(/{{websites}}\s*(\|\s*)?(\n)?/, "");
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
          { user_id: userId, resume_id: resumeId, file: formatType, lastUsed_styleId: styleId || 'basic', lastUsed_templateId: templateId || 'default' }, // Search filter
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
            lastUsed_format: formatType, 
            lastUsed_styleId: styleId, 
            lastUsed_templateId: templateId,
            last_formattedResumeId: updatedOrCreatedDoc._id,
        })

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
