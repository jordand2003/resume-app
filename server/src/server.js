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

// Auth0 configuration
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  tokenSigningAlg: "RS256",
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

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
app.use("/api/auth", authRoutes);

// History Career Routes
app.use("/api/resume", careerRoutes);

// Resume Upload Routes
app.use("/api/resume", resumeUploadRoutes);

// Education Routes
app.use("/api/education", educationRoutes);

// Protected route example
app.get("/api/protected", checkJwt, (req, res) => {
  res.json({ message: "This is a protected route", user: req.auth });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
