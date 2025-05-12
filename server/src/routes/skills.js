const express = require("express");
const router = express.Router();
const { verifyJWT, extractUserId } = require("../middleware/auth");
const { SkillList } = require("../services/structuredDataService");
const mongoose = require("mongoose");

// Get Skill information 
router.get("/", verifyJWT, extractUserId, async (req, res) => {
    try {
        const userId = req.userId;

        // Fetch the skill list
        const skillList = await SkillList.findOne({ user_id: userId });

        if (!skillList) {
            // If no skill list exists, return an empty array
            return res.status(200).json({
                message: "No skills found for this user",
                data: [],
            });
        }

        // Return the skills array
        return res.status(200).json({
            message: "Skill information retrieved successfully",
            data: skillList.skills,
        });

    } catch (error) {
        console.error("Error retrieving skills:", error);
        return res.status(500).json({
            message: "Failed to retrieve skills",
            error: error.message,
        });
    }
});

// UPDATE 1 entry 
router.put("/:newSkill", verifyJWT, extractUserId, async (req, res) => {
    try {
        const userId = req.userId;
        const { newSkill } = req.params;
        console.log("Received skill data for user");

        // Check MongoDB connection
        const connectionState = mongoose.connection.readyState;
        console.log("MongoDB connection state:", connectionState);
        if (connectionState !== 1) {
            console.error("MongoDB is not connected. State:", connectionState);
            return res.status(500).json({
                message: "Database connection error",
            });
        }

        // Fetch the skill list
        const skillList = await SkillList.findOne({ user_id: userId });

        // Create a new document if none exists
        if (!skillList) {
            const newSkillList = new SkillList({
                user_id: userId,
                skills: [newSkill],
            });
            await newSkillList.save();
            return res.status(200).json({ message: "Added new skill" });
        }

        // Check if skill is already present
        if (skillList.skills.includes(newSkill)) {
            return res.status(400).json({ message: 'You already have "'+ newSkill + '" listed.' });
        }

        // If not present, add it
        await SkillList.findOneAndUpdate(
            { user_id: userId },
            { $push: { skills: newSkill } }
        );
        return res.status(200).json({ message: "Added new skill" });

    } catch (error){
        console.error("Error adding skill:", error);
        return res.status(500).json({
            message: "Failed to add skill",
            error: error.message,
        });
    }
});

// POST Skill information (NOT FINISHED)
router.post("/pull_from_resumes", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    const { updatedSkills } = req.body;

    console.log("Received skill data for user");

    if (!updatedSkills || !Array.isArray(updatedSkills)) {
      console.log("No skill array provided in request");
      return res.status(400).json({
        status: "Failed",
        message: "Skill data is required and must be an array",
      });
    }

    // Check for duplicates & autoremove

    //console.log("hype testing", education[0], education[0].gpa,)
    // Attempt to update job_id if it exists
    const updateDocument = {
      $set: {
        Institute: education[0].Institute,
        Location: education[0].Location,
        Degree: education[0].Degree,
        Major: education[0].Major,
        GPA: education[0].GPA,
        Start_Date: education[0].Start_Date,
        End_Date: education[0].End_Date,
        RelevantCoursework: education[0].RelevantCoursework, 
        other: education[0].other, 
      },
   };
    const result = await EducationHistory.updateOne({ _id: education[0]._id }, updateDocument)
    newEntry = false;         // default response
    responseData = education; // default response
    //console.log(result.matchedCount, education._id)
    if(result.matchedCount === 0){ // Add new entry if no update made
      console.log("adding...")
      console.log(education[0])
      const newEducation = new EducationHistory({
        user_id: userId,
        Institute: education[0].Institute,
        Location: education[0].Location,
        Degree: education[0].Degree,
        Major: education[0].Major,
        GPA: education[0].GPA,
        Start_Date: education[0].Start_Date,
        End_Date: education[0].End_Date,
        RelevantCoursework: education[0].RelevantCoursework, // doesn't exist yet
        other: education[0].other, // doesn't exist yet
      });
      await newEducation.save();
      responseData = newEducation;
      newEntry = true;
    } 

    res.json({
      status: "Success",
      message: "Education entry submitted successfully",
      data: responseData,
      newEntry: newEntry
    });

  } catch (error) {
    console.error("Submit Education error:", error);
    res.status(500).json({
      status: "Failed",
      message: "Submit Education failed due to internal error.",
      error: error.message,
    });
  }
});

// Delete 1 entry from the array
router.delete("/:markedSkill", verifyJWT, extractUserId, async (req, res) => {
    try {
        const userId = req.userId;
        const { markedSkill } = req.params;
        console.log("Received " + markedSkill + " data for user");

        // Check MongoDB connection
        const connectionState = mongoose.connection.readyState;
        console.log("MongoDB connection state:", connectionState);
        if (connectionState !== 1) {
            console.error("MongoDB is not connected. State:", connectionState);
            return res.status(500).json({
                message: "Database connection error",
            });
        }

        // Fetch the skill list
        const skillList = await SkillList.findOne({ user_id: userId });
        if (!skillList) {
            return res.status(400).json({ message: "There's no skill list associated with you" });
        }

        // Update/Remove entry
        await SkillList.findOneAndUpdate(
            { user_id: userId },
            { $pull: { skills: markedSkill } }
        );
        return res.status(200).json({ message: "Removed skill" });

    } catch (error){
        console.error("Error deleting skill:", error);
        return res.status(500).json({
            message: "Failed to delete skill",
            error: error.message,
        });
    }
});

module.exports = router;
