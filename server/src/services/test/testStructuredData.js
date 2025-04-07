const mongoose = require("mongoose");
const path = require("path");
const { saveStructuredData } = require("../structuredDataService");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Debug logging
console.log("Environment variables loaded:");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Present" : "Missing");
console.log(
  "GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY ? "Present" : "Missing"
);
console.log("API Key value:", process.env.GEMINI_API_KEY ? "Set" : "Not set");

// Sample resume content
const sampleContent = `
John Doe

Education:
- Bachelor of Science in Computer Science
  Stanford University
  2016-2020
  GPA: 3.8
  Relevant Coursework: Data Structures, Algorithms, Machine Learning

Work Experience:
- Software Engineer, Google, Mountain View, CA
  2020-2022
  Responsibilities:
    - Developed full-stack applications using React and Node.js
    - Led a team of 3 developers on a critical project
    - Improved system performance by 40%

- Software Engineering Intern, Microsoft, Redmond, WA
  Summer 2019
  Responsibilities:
    - Implemented new features for Azure cloud services
    - Fixed critical bugs in production code
    - Collaborated with senior engineers on system design
`;

// Similar content but with slight differences
const similarContent = `
John Doe

Education:
- BS in Computer Science
  Stanford University
  2016-2020
  GPA: 3.8
  Coursework: Data Structures, Algorithms

Work Experience:
- Senior Software Engineer, Google, Mountain View
  2020-2022
  Responsibilities:
    - Full-stack development with React/Node.js
    - Team leadership
    - Performance optimization

- Intern, Microsoft, Redmond
  2019
  Responsibilities:
    - Azure development
    - Bug fixes
    - Team collaboration
`;

// Function to create different content by replacing names
function createDifferentContent(content) {
  return content
    .replace(/John Doe/g, "Jane Smith")
    .replace(/Google/g, "Facebook")
    .replace(/Microsoft/g, "Amazon");
}

async function testStructuredDataService() {
  try {
    // Check for required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn(
        "Warning: GEMINI_API_KEY is not defined. Will use fallback parser."
      );
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    console.log("\nTesting structured data service...");

    // Test 1: Process new content
    console.log("\n1. Testing with new content:");
    const result1 = await saveStructuredData(sampleContent);
    console.log("Result:", JSON.stringify(result1, null, 2));

    // Test 2: Process similar content (should trigger merge)
    console.log("\n2. Testing with similar content (should merge):");
    const result2 = await saveStructuredData(sampleContent);
    console.log("Result:", JSON.stringify(result2, null, 2));

    // Test 3: Process different content
    console.log("\n3. Testing with different content:");
    const differentContent = createDifferentContent(sampleContent);
    const result3 = await saveStructuredData(differentContent);
    console.log("Result:", JSON.stringify(result3, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\nClosed MongoDB connection");
  }
}

// Run the test
testStructuredDataService();
