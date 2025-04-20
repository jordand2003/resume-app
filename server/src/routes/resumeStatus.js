const express = require("express");
const router = express.Router();
const { verifyJWT, extractUserId } = require("../middleware/auth");
const mongoose = require("mongoose");
//const ResumeSchema = require("../models/Resume");

router.get("/:resumeId", verifyJWT, extractUserId, async (req, res) => {
    try {
        // Checks if resumeId is undefined/not passed
        console.log("Cookie checker");
        let status = document.cookie
            .split("; ")
            .find((row) => row.startsWith("status="))
            ?.split("=")[1];
        console.log(document.cookie);
        console.log(status);
        if (!req.paramas.resumeId)
            return res.status(404).json({
                status: "Failed",
                message: "Resume id is undefined",
            });
        const userId = req.userId;
        const resumeId = req.params.resumeId;
        const connectionState = mongoose.connection.readyState;
        if (connectionState !== 1) {
            console.error("MongoDB is not connected. State:", connectionState);
            return res.status(500).json({
                status: "Failed",
                message: "Database connection error"
            });
        }
        // Cursor for Resume lookup in the database
        const Resumes = mongoose.model("Resumes", ResumeSchema);
        // Actual query 
        // resume_id: resumeId - The query condition, ie. selected resume must have matching resume id. 
        // "user_id status"    - The fields we want to get.
        const query = await Resumes.findOne({ resume_id: resumeId }, "user_id status").exec();
        // If query returns nothing
        if (!query) 
            return res.status(404).json({ message: "Resume not found" });
        // If resume has a different user_id
        if (query.user_id !== userId)
            return res.status(403).json({ message: "User does not have access to resume" });
        // The rest handles the three possible statuses the resume may have.
        // To do: Figure out how to retreive resume generation's fail message in order to have a meaningful error
        if (query.status === "failed")
            return res.status(200).json({ 
                status: "Failed",
                message: "Resume generation failed" 
            });
        if (query.status === "processing")
            return res.status(200).json({ status: "Processing" });
        if (query.status === "completed")
            return res.status(200).json({ status: "Completed" });
    } catch (error) {
        return res.status(500).json({
            message: "Network failed to retrieve resume status"
        });
    }
});

module.exports = router;