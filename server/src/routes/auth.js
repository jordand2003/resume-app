const express = require("express");
const router = express.Router();
const { ManagementClient } = require("auth0");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");

// Initialize Auth0 Management API client
const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

// Get user by ID
router.get("/users/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.userId });
    console.log("Get user result:", user); // Add this line
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

router.get("/users/e2", async (req, res) => {
  res.json("lol")
});


// Create new user
router.post("/users", async (req, res) => {
  try {
    const { user_id, email, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ user_id });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = new User({
      user_id,
      email,
      name
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Create user in Auth0
    const user = await management.users.create({
      connection: "Username-Password-Authentication",
      email,
      password,
      email_verified: false,
    });

    // Send verification email
    await management.jobs.verifyEmail({
      user_id: user.user_id,
    });

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({
      message: error.message || "Registration failed. Please try again.",
    });
  }
});

// Verify email endpoint
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = jwt.verify(token, process.env.AUTH0_CLIENT_SECRET);
    const { user_id } = decoded;

    // Update user's email_verified status
    await management.users.update({ id: user_id }, { email_verified: true });

    res.json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(400).json({
      message:
        "Invalid or expired verification link. Please request a new one.",
    });
  }
});

// Resend verification email endpoint
router.post("/resend-verification", async (req, res) => {
  try {
    const { user_id } = req.body;

    // Send verification email
    await management.jobs.verifyEmail({
      user_id,
    });

    res.json({
      message: "Verification email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(400).json({
      message:
        error.message || "Failed to send verification email. Please try again.",
    });
  }
});

module.exports = router;
