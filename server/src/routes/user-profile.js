const express = require("express");
const router = express.Router();
const { verifyJWT, extractUserId } = require("../middleware/auth");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require('../models/Users');

//allow user to set contact info(phone and email)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".png", ".jpg", ".jpeg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PNG and JPEG photos are allowed."));
    }
  },
});

router.post(
  "/upload_photo",
  verifyJWT,
  extractUserId,
  upload.single("photo"),
  async (req, res) => {
    try {
      const userId = req.userId;

      if (!req.file) {
        return res.status(400).json({
          status: "Failed",
          message: "No photo uploaded",
        });
      }

      if (!userId) {
        return res.status(400).json({
          status: "Failed",
          message: "User ID not found",
        });
      }

      // Convert the uploaded file to base64
      const base64Photo = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

      // Update user's photo in the database
      const updatedUser = await User.findOneAndUpdate(
        { user_id: userId },
        { $set: { photo: base64Photo } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          status: "Failed",
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: "Success",
        data: base64Photo,
      });
    } catch (error) {
      console.error("Photo upload error:", error);
      return res.status(500).json({
        status: "Failed",
        message: "Error uploading photo",
      });
    }
  }
);

// Get user's photo
router.get("/photo", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    console.log("Fetching photo for user ID:", userId);

    const user = await User.findOne({ user_id: userId });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({
        status: "Failed",
        message: "User not found",
      });
    }

    console.log("User photo exists:", user.photo ? "Yes" : "No");
    return res.status(200).json({
      status: "Success",
      data: user.photo || null,
    });
  } catch (error) {
    console.error("Error fetching photo:", error);
    return res.status(500).json({
      status: "Failed",
      message: "Error fetching photo",
    });
  }
});

//GET API to retrieve phone number
router.get("/phone", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId; //Oauth id

        // Check MongoDB connection
        //const connectionState = mongoose.connection.readyState;
        //console.log("MongoDB connection state:", connectionState);
        
        const user = await User.findOne({user_id: userId}); //this ID matches Oauth ID in db
        
        if (!user) {
            return res.status(404).json({ 
              status: "Failed", 
              message: "User not found" });
        }
        
        const phoneNumber = user.phone; //found
        if (phoneNumber){
            return res.status(200||304).json({ 
              status: "Success", 
              phoneNumber });
        }
        else {
            const phoneNumber = "";
            return res.status(204).json({
              status: "Success", 
              message: "No phone exists.", 
              phoneNumber}); //what if null??
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
      return res
        .status(404)
        .json({ status: "Failed", message: "User not found." });
    }

    if (!phone) {
      return res
        .status(400)
        .json({ status: "Failed", message: "No phone number entered." });
    }

    return res.status(200).json({
      status: "Success",
      message: "Phone number updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Cannot update phone number:", error);
    return res.status(500).json({ status: "Failed" });
  }
});

//GET API to retrieve primary email
router.get("/email", verifyJWT, extractUserId, async (req, res) => {
  try {
    const userId = req.userId; //Oauth id

      // Check MongoDB connection
      const connectionState = mongoose.connection.readyState;
      //console.log("MongoDB connection state:", connectionState);

      const user = await User.findOne({user_id: userId}); //this ID matches Oauth ID in db
      
      if (!user) {
        console.log("invalid user!")
        return res.status(404).json({ status: "Failed", message: "User not found" });
      }
      const primaryEmail = user.email;

      if (primaryEmail){   
        return res.status(200).json({ status: "Success", primaryEmail })
      }

     }
     catch(error){
      console.log("error: ", error);
      return; //res.status(500).json({ status: "Failed", message: "Cant get email."});
     }
  }
);

//POST API to set primary email
router.post("/email", verifyJWT, extractUserId, async (req, res) => {
  try {
      const userId = req.userId; //Oauth ID
      const { email: primaryEmail } = req.body;
      const updatedUser = await User.findOneAndUpdate(
        { user_id: userId },
        { $set: { email: primaryEmail } },
        { new: true, upsert: false }
      );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Could not update." });
    }

      return !primaryEmail
          ? res.status(400).json({ status: "Failed", message: "No email entered."})
          : res.status(200).json({ status: "Success", message: "Email updated successfully.", user: updatedUser });
     }
     catch (error) {
      console.error("Cannot update primary email:", error);
      return res.status(500).json({ status: "Failed"});
     }
  }
);

module.exports = router;
