const express = require("express");
const router = express.Router();
const { verifyJWT, extractUserId } = require("../middleware/auth");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require('../models/Users');

//allow user to upload profile photo, set contact info(phone and secondary email)
//maybe use google/github photo if signed in with OAuth

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    photoSize: 5 * 1024 * 1024, // 5MB limit
  },
  photoFilter: (req, file, cb) => {
      const allowedTypes = [".png", ".jpeg"];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only PNG and JPEG photos are allowed."));
      }
    },
});

router.post("/upload_photo", verifyJWT, extractUserId,
    upload.single("image"),
    async (req, res) => {
        try {
          console.log("Upload image request received:", {
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
            console.log("No photo uploaded");
            return res.status(400).json({
              status: "Failed",
              message: "No photo uploaded",
            });
          }
    
          if (!req.userId) {
            console.log("No userId found in request");
            return res.status(400).json({
              status: "Failed",
              message: "User ID not found",
            });
          }
    
          console.log("Processing photo:", {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          });
    
          // Process the photo
          const result = await resumeUpload(req.file);
          console.log("Resume processing result:", {
            hasData: !!result,
            hasParsedData: result?.parsedData ? true : false,
            hasRawText: result?.rawText ? true : false,
            parsedData: result?.parsedData,
          });
      
        } 
        catch (error) {
          console.error("Photo upload error:", error);
        }
          
    }
);

//GET API to retrieve phone number
router.get("/phone", verifyJWT, extractUserId, async (req, res) => {
    try {
        const userId = req.userId; //Oauth id
        console.log("here is user info:", userId);

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

        const user = await User.findOne({user_id: userId}); //this ID matches Oauth ID in db
        if (!user) {
            return res.status(404).json({ status: "Failed", message: "User not found" });
        }

        console.log("Here is user info:", user);
        
        if (user.phone){
            const phoneNumber = user.phone; //found
            return res.status(200).json({ status: "Success", phoneNumber });
        }
        else {
            const phoneNumber = "";
            return res.status(204).json({status: "Success", message: "No phone exists.", phoneNumber});
        }
        
       }
       catch(error){
        console.error("Cant get phone number.", error);
       }
    }
);

router.post("/phone", verifyJWT, extractUserId, async (req, res) => {
    console.log("Incoming POST request body:", req.body);   
    try {
        const userId = req.userId; //Oauth ID
        const {phoneNumber} = req.body;
        const user = await User.findOne({user_id: userId});
        
        if (!user) {
            return res.status(404).json({ status: "Failed", message: "User not found" });
        }
        
        if (!phoneNumber){
            return res.status(400).json({ status: "Failed", message: "No phone number found"});
        }
        
        user.phone = phoneNumber;
        const updatedUser= await user.save();

        return res.status(200).json({ status: "Success", message: "Phone number updated successfully.", user: updatedUser });
       }
       catch {
        console.error("Cannot update phone number:", error);
        return res.status(500).json({ status: "Failed"});
       }
    }
);

module.exports = router;