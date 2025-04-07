const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Debug logging for API key
console.log(
  "Initializing Gemini AI with API key:",
  process.env.GEMINI_API_KEY ? "Present" : "Missing"
);
console.log("API Key value:", process.env.GEMINI_API_KEY ? "Set" : "Not set");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Schema for structured resume data
const ResumeDataSchema = new mongoose.Schema({
  rawContent: {
    type: String,
    required: true,
    trim: true,
  },
  parsedData: {
    education: [
      {
        Institute: String,
        Location: String,
        Degree: String,
        Major: String,
        Start_Date: String,
        End_Date: String,
        GPA: String,
        RelevantCoursework: String,
        other: String,
      },
    ],
    work_experience: [
      {
        Job_Title: String,
        Company: String,
        Location: String,
        Start_Date: String,
        End_Date: String,
        Responsibilities: [String],
      },
    ],
  },
  similarDocuments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResumeData",
    },
  ],
  isMergedDocument: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  contentHash: {
    type: String,
    required: true,
    index: true,
  },
  keywords: [String], // For better duplicate detection
});

// Create normalized version of content for duplicate checking
ResumeDataSchema.methods.getNormalizedContent = function () {
  return this.rawContent.toLowerCase().replace(/\s+/g, " ").trim();
};

// Extract keywords from content for better duplicate detection
ResumeDataSchema.methods.extractKeywords = function () {
  const content = this.getNormalizedContent();
  const words = content.split(/\s+/);
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
  ]);
  return words
    .filter((word) => !stopWords.has(word) && word.length > 2)
    .slice(0, 100); // Keep top 100 keywords
};

const ResumeData = mongoose.model("ResumeData", ResumeDataSchema);

/**
 * Extract structured data using AI
 * @param {string} content - Raw content to process
 * @returns {Promise<Object>} Structured data object
 */
async function extractStructuredData(content) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Extract structured information from the following resume text. Format the response as a JSON object with the following structure:
{
  "education": [
    {
      "Institute": "university name",
      "Location": "city, state",
      "Degree": "degree name",
      "Major": "field of study",
      "Start_Date": "YYYY",
      "End_Date": "YYYY or Present",
      "GPA": "X.XX",
      "RelevantCoursework": "course1, course2, ...",
      "other": "additional info"
    }
  ],
  "work_experience": [
    {
      "Job_Title": "position title",
      "Company": "company name",
      "Location": "city, state",
      "Start_Date": "YYYY",
      "End_Date": "YYYY or Present",
      "Responsibilities": [
        "responsibility 1",
        "responsibility 2",
        ...
      ]
    }
  ]
}

Resume Text:
${content}

Return only valid JSON without any additional text or explanation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Remove markdown formatting if present
    if (text.startsWith("```")) {
      text = text.replace(/^```json\n/, "").replace(/\n```$/, "");
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
  } catch (error) {
    console.error("AI extraction failed:", error);
    // Fallback to simple parser if AI fails
    return simpleParser(content);
  }
}

/**
 * Simple parser as fallback if AI fails
 * @param {string} content - Raw content to process
 * @returns {Object} Structured data object
 */
function simpleParser(content) {
  try {
    const lines = content.split("\n").map((line) => line.trim());
    const structuredData = {
      education: [],
      work_experience: [],
    };

    let currentSection = null;
    let currentEntry = null;
    let isReadingResponsibilities = false;
    let currentResponsibilities = [];

    for (const line of lines) {
      if (!line) continue;

      // Handle section changes
      if (line.toLowerCase().includes("education:")) {
        if (currentEntry) {
          if (currentSection === "education") {
            structuredData.education.push(currentEntry);
          } else if (currentSection === "work_experience") {
            currentEntry.Responsibilities = currentResponsibilities;
            structuredData.work_experience.push(currentEntry);
          }
        }
        currentSection = "education";
        currentEntry = null;
        isReadingResponsibilities = false;
        currentResponsibilities = [];
        continue;
      } else if (line.toLowerCase().includes("work experience:")) {
        if (currentEntry) {
          if (currentSection === "education") {
            structuredData.education.push(currentEntry);
          } else if (currentSection === "work_experience") {
            currentEntry.Responsibilities = currentResponsibilities;
            structuredData.work_experience.push(currentEntry);
          }
        }
        currentSection = "work_experience";
        currentEntry = null;
        isReadingResponsibilities = false;
        currentResponsibilities = [];
        continue;
      }

      if (currentSection === "education") {
        if (line.startsWith("-")) {
          if (currentEntry) {
            structuredData.education.push(currentEntry);
          }
          currentEntry = {
            Institute: "",
            Location: "",
            Degree: line.substring(1).trim(),
            Major: "",
            Start_Date: "",
            End_Date: "",
            GPA: "",
            RelevantCoursework: "",
            other: "",
          };
        } else if (currentEntry) {
          if (line.includes("GPA:")) {
            currentEntry.GPA = line.split(":")[1].trim();
          } else if (line.includes("Coursework:")) {
            currentEntry.RelevantCoursework = line.split(":")[1].trim();
          } else if (!currentEntry.Institute) {
            currentEntry.Institute = line;
          } else if (line.match(/\d{4}/)) {
            const years = line.match(/\d{4}/g);
            if (years && years.length > 0) {
              currentEntry.Start_Date = years[0];
              currentEntry.End_Date = years[1] || "Present";
            }
          }
        }
      } else if (currentSection === "work_experience") {
        if (line.startsWith("-") && !line.startsWith("  -")) {
          // Save previous entry with its responsibilities
          if (currentEntry) {
            currentEntry.Responsibilities = currentResponsibilities;
            structuredData.work_experience.push(currentEntry);
          }

          // Parse job title line
          const titleLine = line.substring(1).trim();
          currentEntry = {
            Job_Title: "",
            Company: "",
            Location: "",
            Start_Date: "",
            End_Date: "",
            Responsibilities: [],
          };
          currentResponsibilities = [];

          // Try to extract company and location if they're in the same line
          if (titleLine.includes(",")) {
            const parts = titleLine.split(",").map((p) => p.trim());
            currentEntry.Job_Title = parts[0];
            if (parts.length > 1) {
              currentEntry.Company = parts[1];
            }
            if (parts.length > 2) {
              currentEntry.Location = parts[2];
            }
          } else {
            currentEntry.Job_Title = titleLine;
          }

          isReadingResponsibilities = false;
        } else if (currentEntry) {
          if (line.toLowerCase().includes("responsibilities:")) {
            isReadingResponsibilities = true;
          } else if (
            isReadingResponsibilities &&
            (line.startsWith("  -") ||
              line.startsWith("   -") ||
              line.startsWith("    -"))
          ) {
            // This is a responsibility
            const responsibility = line.replace(/^[\s-]+/, "").trim();
            if (responsibility) {
              currentResponsibilities.push(responsibility);
            }
          } else if (!isReadingResponsibilities) {
            // This might be company/location information or dates
            if (line.includes(",")) {
              const [company, location] = line.split(",").map((p) => p.trim());
              if (!currentEntry.Company && company) {
                currentEntry.Company = company;
              }
              if (!currentEntry.Location && location) {
                currentEntry.Location = location;
              }
            }
            // Check for dates
            const dateMatch = line.match(
              /(\d{4})-(\d{4}|Present|present)|Summer\s+(\d{4})/i
            );
            if (dateMatch) {
              if (dateMatch[3]) {
                // Summer internship format
                currentEntry.Start_Date = dateMatch[3];
                currentEntry.End_Date = dateMatch[3];
              } else {
                currentEntry.Start_Date = dateMatch[1];
                currentEntry.End_Date = dateMatch[2] || "Present";
              }
            }
          }
        }
      }
    }

    // Add the last entry if exists
    if (currentEntry) {
      if (currentSection === "education") {
        structuredData.education.push(currentEntry);
      } else if (currentSection === "work_experience") {
        currentEntry.Responsibilities = currentResponsibilities;
        structuredData.work_experience.push(currentEntry);
      }
    }

    return structuredData;
  } catch (error) {
    throw new Error(`Data extraction failed: ${error.message}`);
  }
}

/**
 * Check for similar documents using multiple criteria
 * @param {string} normalizedContent - Normalized content to check
 * @param {Array<string>} keywords - Keywords extracted from content
 * @returns {Promise<Object>} Similar documents info
 */
async function findSimilarDocuments(normalizedContent, keywords) {
  // Find documents with similar content using multiple criteria
  const similarDocs = await ResumeData.find({
    $or: [
      // Check for exact content match
      {
        contentHash: require("crypto")
          .createHash("md5")
          .update(normalizedContent)
          .digest("hex"),
      },
      // Check for keyword overlap
      { keywords: { $in: keywords }, isMergedDocument: false },
      // Check for text similarity
      {
        rawContent: {
          $regex: new RegExp(
            normalizedContent
              .substring(0, 100)
              .replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
            "i"
          ),
        },
        isMergedDocument: false,
      },
    ],
  }).limit(5);

  if (similarDocs.length === 0) {
    return { hasSimilar: false };
  }

  // Calculate similarity scores
  const scores = similarDocs.map((doc) => {
    const keywordOverlap =
      keywords.filter((k) => doc.keywords.includes(k)).length / keywords.length;
    return {
      doc,
      score: keywordOverlap,
    };
  });

  // Filter out documents with low similarity
  const significantMatches = scores.filter((s) => s.score > 0.3);

  return {
    hasSimilar: significantMatches.length > 0,
    documents: significantMatches.map((s) => s.doc),
  };
}

/**
 * Merge similar documents into a new summary document
 * @param {Array} documents - Array of similar documents
 * @returns {Promise<Object>} Merged document
 */
async function mergeSimilarDocuments(documents) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Combine all documents' structured data
    const allData = documents.map((doc) => doc.parsedData);

    const prompt = `Given these similar resume entries, create a single merged entry that combines and summarizes the information, removing duplicates and keeping the most detailed/recent information:
    ${JSON.stringify(allData)}
    
    Return only the merged JSON object with the same structure, without any additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Remove markdown formatting if present
    if (text.startsWith("```")) {
      text = text.replace(/^```json\n/, "").replace(/\n```$/, "");
    }

    const mergedData = JSON.parse(text);

    // Create new merged document
    const mergedDoc = new ResumeData({
      rawContent: documents[0].rawContent,
      parsedData: mergedData,
      similarDocuments: documents.map((doc) => doc._id),
      isMergedDocument: true,
      contentHash: require("crypto")
        .createHash("md5")
        .update(documents[0].rawContent.toLowerCase().trim())
        .digest("hex"),
      keywords: documents[0].keywords,
    });

    await mergedDoc.save();
    return mergedDoc;
  } catch (error) {
    console.error("Merge failed:", error);
    // Fallback to using the most recent document as base
    const mergedDoc = new ResumeData({
      rawContent: documents[0].rawContent,
      parsedData: documents[0].parsedData,
      similarDocuments: documents.map((doc) => doc._id),
      isMergedDocument: true,
      contentHash: require("crypto")
        .createHash("md5")
        .update(documents[0].rawContent.toLowerCase().trim())
        .digest("hex"),
      keywords: documents[0].keywords,
    });

    await mergedDoc.save();
    return mergedDoc;
  }
}

/**
 * Main function to save structured data from content
 * @param {string} content - Raw content to process
 * @returns {Promise<Object>} Result of the operation
 */
async function saveStructuredData(content) {
  try {
    // Extract structured data
    const structuredData = await extractStructuredData(content);

    // Create new document
    const normalizedContent = content.toLowerCase().replace(/\s+/g, " ").trim();
    const doc = new ResumeData({
      rawContent: content,
      parsedData: structuredData,
      contentHash: require("crypto")
        .createHash("md5")
        .update(normalizedContent)
        .digest("hex"),
      keywords: [],
    });

    // Extract keywords
    doc.keywords = doc.extractKeywords();

    // Check for duplicates/similar documents
    const { hasSimilar, documents } = await findSimilarDocuments(
      normalizedContent,
      doc.keywords
    );

    if (hasSimilar) {
      // If similar documents exist, try to merge them
      try {
        const mergedDoc = await mergeSimilarDocuments([...documents, doc]);
        return {
          status: "merged",
          message: "Content was merged with similar existing entries",
          data: mergedDoc.parsedData,
          mergedCount: documents.length + 1,
        };
      } catch (mergeError) {
        console.warn("Merge failed, saving as new document:", mergeError);
      }
    }

    // Save as new document
    await doc.save();

    return {
      status: "success",
      message: "Content processed and saved successfully",
      data: structuredData,
    };
  } catch (error) {
    throw new Error(`Failed to save structured data: ${error.message}`);
  }
}

module.exports = {
  saveStructuredData,
  ResumeData,
};
