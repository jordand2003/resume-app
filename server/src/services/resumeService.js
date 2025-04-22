const Resume = require("../models/Resume");
const JobDesc = require("../models/JobDesc");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ResumeData } = require("../services/structuredDataService");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class ResumeService {
  static async generateResume(_id, userId) {
    let resume;
    try {
      // Create a new resume entry with PENDING status
      resume = new Resume({
        job_id: _id, // Just store the MongoDB _id
        status: "PENDING",
        //content: null,
      });
      await resume.save();

      // Get job description from JobDesc model using MongoDB _id
      const jobDesc = await JobDesc.findById(_id);
      if (!jobDesc) {
        throw new Error("Job description not found");
      }

      // Get career history from ResumeData
      const careerHistory = await this.getCareerHistory(userId);
      if (!careerHistory || careerHistory.length === 0) {
        throw new Error("Career history not found");
      }

      // Construct AI prompt
      const prompt = this.constructAIPrompt(jobDesc, careerHistory);

      // Something funky going on here
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedContent = JSON.parse(cleanJsonResponse(response.text()));

      // Update resume
      resume.content = generatedContent;
      resume.status = "COMPLETED";
      await resume.save();

      return {
        resumeId: resume._id,
        status: "COMPLETED",
      };
    } catch (error) {
      // If resume was created, update its status to FAILED
      if (resume) {
        resume.status = "FAILED";
        await resume.save();
      }
      throw error;
    }
  }

  static async getResumeStatus(resumeId) {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      throw new Error("Resume not found");
    }
    return {
      status: resume.status,
      content: resume.status === "COMPLETED" ? resume.content : null,
    };
  }

  static constructAIPrompt(jobDesc, careerHistory) {
    return `
You are a professional resume writer. Generate a structured resume in JSON format based on the following information.

Job Description:
Company: ${jobDesc.company}
Title: ${jobDesc.job_title}
Description: ${jobDesc.description}

Career History:
${JSON.stringify(careerHistory, null, 2)}

Return ONLY a JSON object with exactly the following structure, with no additional text or explanation:
{
  "summary": "Professional summary",
  "experience": [{
    "title": "Job title",
    "company": "Company name",
    "duration": "Duration",
    "achievements": ["achievement1", "achievement2"]
  }],
  "skills": ["skill1", "skill2"],
  "education": [{
    "degree": "Degree name",
    "institution": "Institution name",
    "year": "Year"
  }]
}`;
  }

  static async getCareerHistory(userId) {
    // Get the most recent resume data for the user
    const resumeData = await ResumeData.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!resumeData) {
      return null;
    }

    // Return the work experience from the parsed data
    return resumeData.parsedData?.work_experience || [];
  }
}

function cleanJsonResponse(responseText) {
  if (responseText.startsWith("```json") && responseText.endsWith("```")) {
    // Extract the JSON string and trim any leading/trailing whitespace
    const jsonString = responseText
      .substring(7, responseText.length - 3)
      .trim();
    console.log(jsonString)
    return jsonString;
  } else {
    // If no delimiters, return the original string
    return responseText;
  }
}

module.exports = ResumeService;
