const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: "../.env" });

const resumeUpload = async (file) => {
  try {
    console.log("Starting resume upload process");

    if (!file) {
      throw new Error("No file uploaded");
    }

    // Convert file object to buffer
    const fileBuffer = file.buffer;
    const fileExtension = path.extname(file.originalname).toLowerCase();
    console.log("File extension:", fileExtension);

    // Identify extension
    let resume_text = "";
    if (fileExtension === ".docx") {
      console.log("Processing DOCX file");
      resume_text = await docx2Text(fileBuffer);
    } else if (fileExtension === ".pdf") {
      console.log("Processing PDF file");
      resume_text = await pdf2Text(fileBuffer);
    } else {
      throw new Error("Extension not supported.");
    }

    console.log("Resume text extracted, length:", resume_text.length);

    // Comb through text + return JSON formatted response
    const gemini_key = process.env.GEMINI_API_KEY;
    if (!gemini_key) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    console.log("Initializing Gemini AI");
    const ai = new GoogleGenerativeAI({ apiKey: gemini_key });
    const json = await parse(ai, resume_text.trim("\n"));
    console.log("Raw Gemini response:", json);

    const cleanedJson = cleanJsonResponse(json);
    console.log("Cleaned JSON:", cleanedJson);

    try {
      const parsedJson = JSON.parse(cleanedJson);
      console.log("Successfully parsed JSON");
      return parsedJson;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Raw response:", cleanedJson);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("Resume upload error:", error);
    throw error;
  }
};

/** Convert resume details stored in a DOCX files into String*/
function docx2Text(fbuffer) {
  // Processing message + JSON

  // Convert into pure text data
  return mammoth
    .extractRawText({ buffer: fbuffer })
    .then((result) => {
      let pure_text = result.value;
      return pure_text;
    })
    .catch((err) => {
      console.error("Error processing the DOCX file:");
      throw err; // Re-throw the error to handle it outside this function
    });
}

function pdf2Text(fbuffer) {
  // Processing message + JSON

  // Convert into pure text data
  return pdfParse(fbuffer)
    .then((result) => {
      let pure_text = result.text;
      return pure_text;
    })
    .catch((err) => {
      console.error("Error processing the PDF file:");
      throw err; // Re-throw the error to handle it outside this function
    });
}

// Function to parse using gemini
async function parse(ai, resume_text) {
  try {
    console.log(
      "Starting Gemini AI parsing with text length:",
      resume_text.length
    );

    // Get the model
    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    // Prepare the prompt
    const prompt =
      "Extract the following information from this resume text and return as JSON: {" +
      "'education':[ {'Institute': }, {'Location': }, {'Degree': }, {'Major': }, {'Start_Date': }, {'End_Date': }, {'GPA':}, {'RelevantCoursework': }, {'other': }], " +
      "'work_experience':[ {'Job_Title(s)': }, {'Company': }, {'Location': }, {'Start_Date': }, {'End_Date': }, {'Responsibilities': }]," +
      "} Resume Text: " +
      resume_text;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini AI response received:", text);
    return text;
  } catch (error) {
    console.error("Error in Gemini AI parsing:", error);
    throw error;
  }
}

function cleanJsonResponse(responseText) {
  if (responseText.startsWith("```json") && responseText.endsWith("```")) {
    // Extract the JSON string and trim any leading/trailing whitespace
    const jsonString = responseText
      .substring(7, responseText.length - 3)
      .trim();
    //console.log(jsonString)
    return jsonString;
  } else {
    // If no delimiters, return the original string
    return responseText;
  }
}

// Export Statement
module.exports = resumeUpload;
