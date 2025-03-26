const express = require("express");
const router = express.Router();
const { ManagementClient } = require("auth0");
const jwt = require("jsonwebtoken");

// Initialize Auth0 Management API client
const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
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
