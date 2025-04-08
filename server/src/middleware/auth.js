const { auth } = require("express-oauth2-jwt-bearer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Auth0 JWT verification middleware
const verifyJWT = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: "RS256",
});

// Extract user ID from Auth0 token
const extractUserId = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        status: "Failed",
        message: "No token provided",
      });
    }

    // Decode token to get user info (verification already done by verifyJWT)
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.sub) {
      return res.status(401).json({
        status: "Failed",
        message: "Invalid token",
      });
    }

    // Add Auth0 user ID to request object
    req.userId = decoded.sub;
    next();
  } catch (error) {
    console.error("Token extraction error:", error);
    res.status(401).json({
      status: "Failed",
      message: "Authentication failed",
    });
  }
};

module.exports = {
  verifyJWT,
  extractUserId,
};
