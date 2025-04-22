const express = require("express");
const router = express.Router();
const { verifyJWT, extractUserId } = require("../middleware/auth");
const mongoose = require("mongoose");
const ResumeSchema = require("../models/Resume");

router.get("/:resumeId", verifyJWT, extractUserId, async (req, res) => {
    try {
        console.log("Param:", req.params.resumeId); 
        // Checks if resumeId is undefined/not passed
        if (!req.params?.resumeId) {
            return res.status(401).json({
                status: "Failed",
                message: "Resume id is missing",
            });
        }
        const userId = req.userId;
        const resumeId = req.params.resumeId;
        const connectionState = mongoose.connection.readyState;
        if (connectionState !== 1) {
            console.error("MongoDB is not connected. State:", connectionState);
            return res.status(500).json({
                status: "Failed",
                message: "Failed to connect to Database"
            });
        }
        console.log("query");
        // Cursor for Resume lookup in the database
        // Actual query 
        // resume_id: resumeId - The query condition, ie. selected resume must have matching resume id. 
        // "user_id status"    - The fields we want to get.
        console.log("query");
        const query = await ResumeSchema.findOne({ job_id: resumeId }, "user_id status").exec();
        console.log("after query");
        // If query returns nothing
        if (!query) 
            return res.status(404).json({ message: "Resume not found" });
        // If resume has a different user_id
        if (query.user_id !== userId)
            return res.status(403).json({ message: "User does not have access to resume" });
        // The rest handles the three possible statuses the resume may have.
        // To do: Figure out how to retreive resume generation's fail message in order to have a meaningful error
        if (query.status === "failed")
            return res.status(501).json({ 
                status: "Failed",
                message: "Resume generation failed" 
            });
        if (query.status === "processing")
            return res.status(200).json({ status: "Processing" });
        if (query.status === "completed")
            return res.status(200).json({ status: "Completed" });
    } catch (error) {
        return res.status(502).json({
            message: "Network failed to retrieve resume status"
        });
    }
});

module.exports = router;