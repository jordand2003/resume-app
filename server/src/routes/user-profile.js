const express = require("express");
const router = express.Router();
const { verifyJWT, extractUserId } = require("../middleware/auth");
const mongoose = require("mongoose");
//const multer = require("multer");
const User = require('../models/Users');

//allow user to set contact info(phone and email)

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
