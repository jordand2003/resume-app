const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: "../.env" });

const resumeUpload = async (filepath) => {
  // Convert filepath to Buffer object & get file extension
  const fileBuffer = fs.readFileSync(filepath);
  const fileExtension = path.extname(filepath);

  try {
    // Identify extension
    let resume_text = "";
    if (fileExtension === ".docx") {
      // Convert DOCX file
      resume_text = await docx2Text(fileBuffer);
    } else if (fileExtension === ".pdf") {
      // Convert PDF file
      resume_text = await pdf2Text(fileBuffer);
    } else {
      // Extension mismatch
      throw new Error("Extension not supported.");
    }

    // Comb through text + return JSON formatted response
    gemini_key = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenerativeAI({ apiKey: gemini_key });
    const json = await parse(ai, resume_text.trim("\n"));
    return JSON.parse(cleanJsonResponse(json));
  } catch (error) {
    // Fail message + JSON
    console.log("Upload Failed: " + error.message);
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
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents:
      "Extract the following information from this resume text and return as JSON: {" +
      "'education':[ {'Institute': }, {'Location': }, {'Degree': }, {'Major': }, {''Start_Date': }, {'End_Date': }, {'GPA':}, {'RelevantCoursework': }, {'other': }], " +
      "'work_experience':[ {'Job_Title(s)': }, {'Company': }, {'Location': }, {'Start_Date': }, {'End_Date': }, {'Responsibilities': }]," +
      //+ "'skills':[],"
      //+ "'projects':[ {'project_name': }, {'start_date': }, {'end_date': }, {'summary': }],"
      //+ "'accomplishments':[],"
      "} Resume Text: " +
      resume_text,
  });
  //console.log(response.text);
  return response.text;
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
