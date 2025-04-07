const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
const mongoose = require("mongoose");
const { ResumeData } = require("../structuredDataService");

async function checkDatabase() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully\n");

    // Count documents
    const count = await ResumeData.countDocuments();
    console.log(`Total documents in database: ${count}\n`);

    // Get all documents
    const documents = await ResumeData.find().sort({ createdAt: -1 }).limit(5);
    console.log("Latest 5 documents:");
    documents.forEach((doc, index) => {
      console.log(`\nDocument ${index + 1}:`);
      console.log("ID:", doc._id);
      console.log("Created at:", doc.createdAt);
      console.log("Is merged:", doc.isMergedDocument);
      console.log("Similar documents:", doc.similarDocuments);
      console.log("Education count:", doc.parsedData.education.length);
      console.log(
        "Work experience count:",
        doc.parsedData.work_experience.length
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nClosed MongoDB connection");
  }
}

checkDatabase();
