const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
const mongoose = require("mongoose");
const fs = require("fs");
const { saveStructuredData } = require("../structuredDataService");
const express = require("express");

async function testStructuredDataSaving() {
  console.log("\n=== Testing Structured Data Saving ===");
  try {
    const testData = {
      rawContent: `John Doe
Software Engineer at Google
2020 - Present
Mountain View, CA
• Led development of key features
• Managed team of 5 engineers`,
      parsedData: {
        education: [
          {
            Institute: "Stanford University",
            Location: "Stanford, CA",
            Degree: "Bachelor of Science",
            Major: "Computer Science",
            Start_Date: "2016",
            End_Date: "2020",
            GPA: "3.8",
            RelevantCoursework: "Data Structures, Algorithms",
            other: "",
          },
        ],
        work_experience: [
          {
            Job_Title: "Software Engineer",
            Company: "Google",
            Location: "Mountain View, CA",
            Start_Date: "2020",
            End_Date: "Present",
            Responsibilities: [
              "Developed full-stack applications",
              "Led team projects",
            ],
          },
        ],
      },
    };

    console.log("Testing data saving...");
    const result = await saveStructuredData(testData.rawContent);
    console.log("Save Result:", JSON.stringify(result, null, 2));

    // Test duplicate detection
    console.log("\nTesting duplicate detection...");
    const duplicateResult = await saveStructuredData(testData.rawContent);
    console.log(
      "Duplicate Save Result:",
      JSON.stringify(duplicateResult, null, 2)
    );

    return true;
  } catch (error) {
    console.error("Structured Data Test Error:", error);
    return false;
  }
}

async function testCareerHistory() {
  console.log("\n=== Testing Career History Submission ===");
  try {
    const testHistory = `
            Software Engineer at Google
            2020 - Present
            Mountain View, CA
            - Led development of key features
            - Managed team of 5 engineers
            
            Product Manager at Microsoft
            2018 - 2020
            Redmond, WA
            - Launched new product line
            - Increased revenue by 30%
        `;

    // Import router
    const careerHistory = require("../../routes/career-history");

    // Mock request and response
    const req = {
      body: { text: testHistory },
      params: {},
      get: () => {},
    };

    let responseData = null;
    const res = {
      status: function (code) {
        console.log("Response Status:", code);
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        console.log("Response Data:", JSON.stringify(data, null, 2));
        responseData = data;
        return this;
      },
    };

    // Get the route handler
    const historyRoute = careerHistory.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/history" &&
        layer.route.methods.post
    );

    if (!historyRoute) {
      throw new Error("Could not find POST /history route");
    }

    // Call the handler directly
    await historyRoute.route.stack[0].handle(req, res);

    return responseData && responseData.Status === "Success";
  } catch (error) {
    console.error("Career History Test Error:", error);
    return false;
  }
}

async function runAllTests() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully\n");

    const structuredDataResult = await testStructuredDataSaving();
    const careerHistoryResult = await testCareerHistory();

    console.log("\nTest Results:");
    console.log(
      "Structured Data Saving:",
      structuredDataResult ? "✅ PASS" : "❌ FAIL"
    );
    console.log("Career History:", careerHistoryResult ? "✅ PASS" : "❌ FAIL");
  } catch (error) {
    console.error("Test Suite Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nClosed MongoDB connection");
  }
}

runAllTests();
