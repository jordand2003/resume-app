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
    upload.single("image"), async (req, res) => {
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

        const userId = req.userId; //Oauth ID
        
          if (!req.file) {
            console.log("No photo uploaded");
            return res.status(400).json({
              status: "Failed",
              message: "No photo uploaded",
            });
          }
    
          if (!userId) {
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
          const { photo } = req.body;
          const updatedUser = await User.findOneAndUpdate(
            { user_id: userId },
            { $set: { photo: upload_photo } },
            { new: true, upsert: false }
          );
      
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

        // Check MongoDB connection
        //const connectionState = mongoose.connection.readyState;
        //console.log("MongoDB connection state:", connectionState);
        
        const user = await User.findOne({user_id: userId}); //this ID matches Oauth ID in db
        
        if (!user) {
            return res.status(404).json({ status: "Failed", message: "User not found" });
        }
        
        const phoneNumber = user.phone; //found
        if (phoneNumber){
            return res.status(200||304).json({ status: "Success", phoneNumber });
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

//POST API to retrieve phone number
router.post("/phone", verifyJWT, extractUserId, async (req, res) => {
    try {
        const userId = req.userId; //Oauth ID
        const { phone } = req.body;
        const updatedUser = await User.findOneAndUpdate(
          { user_id: userId },
          { $set: { phone: phone } },
          { new: true, upsert: false }
        );

        if (!updatedUser) {
            return res.status(404).json({ status: "Failed", message: "User not found." });
        }

        if (!phone){
            return res.status(400).json({ status: "Failed", message: "No phone number entered."});
        }
        
        return res.status(200).json({ status: "Success", message: "Phone number updated successfully.", user: updatedUser });
       }
       catch (error) {
        console.error("Cannot update phone number:", error);
        return res.status(500).json({ status: "Failed"});
       }
    }
);

//GET API to retrieve secondary email
router.get("/email2", verifyJWT, extractUserId, async (req, res) => {
  try {
      const userId = req.userId; //Oauth id

      // Check MongoDB connection
      //const connectionState = mongoose.connection.readyState;
      //console.log("MongoDB connection state:", connectionState);

      const user = await User.findOne({user_id: userId}); //this ID matches Oauth ID in db
      if (!user) {
          return res.status(404).json({ status: "Failed", message: "User not found" });
      }
      
      const secondaryEmail = user.email_2;

      if (secondaryEmail){   
        return res.status(200).json({ status: "Success", secondaryEmail })
      }
      else {
        secondaryEmail = "";
        return res.status(204).json({status: "Success", message: "Second email does not exists.", secondaryEmail});
      }

     }
     catch(error){
      return res.status(500).json({ status: "Failed", message: "Cant get second email."});
     }
  }
);

//POST API to set secondary email
router.post("/email2", verifyJWT, extractUserId, async (req, res) => {
  try {
      const userId = req.userId; //Oauth ID
      const { email_2: secondaryEmail } = req.body; //get email_2 set to
      const updatedUser = await User.findOneAndUpdate(
        { user_id: userId },
        { $set: { email_2: secondaryEmail } },
        { new: true, upsert: false }
      );

      if (!updatedUser) {
          return res.status(404).json({ status: "Failed", message: "Could not update." });
      }

      return !secondaryEmail
          ? res.status(400).json({ status: "Failed", message: "No secondary email entered."})
          : res.status(200).json({ status: "Success", message: "Email updated successfully.", user: updatedUser });
     }
     catch (error) {
      console.error("Cannot update secondary email:", error);
      return res.status(500).json({ status: "Failed"});
     }
  }
);

module.exports = router;