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

// MongoDB Connection
console.log("Attempting to connect to MongoDB...");
console.log("MongoDB URI:", process.env.MONGODB_URI ? "Present" : "Missing");
const dbName = process.env.MONGODB_URI.split("/").pop().split("?")[0];
console.log("Database name from URI:", dbName);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    console.log("MongoDB connection state:", mongoose.connection.readyState);
    console.log("MongoDB host:", mongoose.connection.host);
    console.log("MongoDB database:", mongoose.connection.name);
    console.log("MongoDB collections:", mongoose.connection.collections);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Import routes
const authRoutes = require("./routes/auth");
const careerRoutes = require("./routes/career-history");
const resumeUploadRoutes = require("./routes/resume-upload");
const educationRoutes = require("./routes/education");
const statusRoutes = require("./routes/resumeStatus");
const jobDescRoutes = require("./routes/job-desc");
const resumeGenerationRoutes = require("./routes/resumeRoutes");
// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Job Seeker API" });
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Resume Upload Routes
app.use("/api/resume", resumeUploadRoutes);

// Career History Routes
app.use("/api/career-history", careerRoutes);

// Education Routes
app.use("/api/education", educationRoutes);

// Resume Status Checker Routes
app.use("/api/resumes/status", statusRoutes);

// Job Description Routes
app.use("/api/job-desc", jobDescRoutes);

// Resume Generation Routes
app.use("/api/resumes", resumeGenerationRoutes);

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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
