const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { auth } = require("express-oauth2-jwt-bearer");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Debug middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Auth0 configuration
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: "RS256",
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if database connection fails
  });

// Import routes
const authRoutes = require("./routes/auth");
const careerRoutes = require("./routes/career-history");
const resumeUploadRoutes = require("./routes/resume-upload");
const educationRoutes = require("./routes/education");

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Job Seeker API" });
});

// Auth routes
app.use("/auth", authRoutes);

// Resume Upload Routes
app.use("/resume/file", resumeUploadRoutes);

// History Career Routes
app.use("/resume", careerRoutes);

// Education Routes
app.use("/education", educationRoutes);

// Protected route example
app.get("/protected", checkJwt, (req, res) => {
  res.json({ message: "This is a protected route", user: req.auth });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Invalid token" });
  }
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
