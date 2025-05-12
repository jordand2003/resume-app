const Resume = require("../models/Resume");
const JobDesc = require("../models/JobDesc");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ResumeData } = require("../services/structuredDataService");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class ResumeService {
  static async generateResume(_id, userId, selectedCareers, selectedEdus, selectedSkills,) {
    let resume;
    try {
      // Create a new resume entry with PENDING status
      resume = new Resume({
        jobId: _id,
        userId: userId,
        status: "PENDING",
      });
      await resume.save();

      //console.log("llll-", selectedCareers, "llll-", selectedEdus, "llll-", selectedSkills)

      // Get job description from JobDesc model using MongoDB _id
      const jobDesc = await JobDesc.findById(_id);
      if (!jobDesc) {
        throw new Error("Job description not found");
      }

      if (!selectedCareers){
        // Get career history from ResumeData
        selectedCareers = await this.getCareerHistory(userId);
        if (!selectedCareers || selectedCareers.length === 0) {
          throw new Error("Career history not found");
        }
      }
 
      if (!selectedEdus){
        // Get Education history
        selectedEdus = await this.getEduHistory(userId);
        if (!selectedEdus || selectedEdus.length === 0) {
          throw new Error("Education history not found");
        }
      } 

      // Get Skills 
      if (!selectedSkills){
        selectedSkills = await this.getSkills(userId);
        if (!selectedSkills || selectedSkills.length === 0) {
          throw new Error("Education history not found");
        }
      } 

      // Construct AI prompt
      const prompt = this.constructAIPrompt(jobDesc, selectedCareers,   selectedEdus,   selectedSkills);

      // Call Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;

      if (!response || !response.text) {
        console.error("No response text received!");
        throw new Error("Failed to get a valid response from the AI.");
      }

      const generatedText = cleanJsonResponse(response.text());
      console.log("Generated text: ", generatedText);

      // Update resume with generated content
      try {
        const generatedContent = JSON.parse(generatedText);
        resume.jobTitle = jobDesc.job_title,                  // New addition <-------------------
        resume.content = generatedContent;          
        resume.status = "COMPLETED";
        await resume.save();
        return {
          resumeId: resume._id,
          status: "COMPLETED",
        };
      } catch (error) {
        resume.status = "FAILED";
        await resume.save();
        throw new Error("Could not parse Gemini response.");
      }
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

  static constructAIPrompt(jobDesc, careerHistory, eduHistory, skills) {
    return `
You are a professional resume writer. Generate a structured resume in JSON format based on the following information.

Job Description:
Company: ${jobDesc.company}
Title: ${jobDesc.job_title}
Description: ${jobDesc.description}

Skills:
${JSON.stringify(skills, null, 2)}

Career History:
${JSON.stringify(careerHistory, null, 2)}

Eduation History:
${JSON.stringify(eduHistory, null, 2)}

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

  static async getEduHistory(userId){
    // Get the most recent resume data for the user
    const resumeData = await ResumeData.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!resumeData) {
      return null;
    }

    console.log("Education found")
    // Return the education from the parsed data
    return resumeData.parsedData?.education || [];
  }

  static async getSkills(userId){
    // Get the most recent resume data for the user
    const resumeData = await ResumeData.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!resumeData) {
      return null;
    }

    console.log("Education found")
    // Return the education from the parsed data
    return resumeData.parsedData?.skills || [];
  }


  static async getResumesForUser(userId) {
    try {
      const resumes = await Resume.find({ userId })
        .sort({ createdAt: -1 }) // Sort by newest first
        .populate("jobId", "company job_title"); // Get job details

      // Transform the data to include job details
      return resumes.map((resume) => ({
        _id: resume._id,
        content: resume.content,
        status: resume.status,
        createdAt: resume.createdAt,
        jobTitle: resume.jobId?.job_title || "Unknown Job",
        company: resume.jobId?.company || "Unknown Company",
      }));
    } catch (error) {
      console.error("Error fetching resumes:", error);
      throw error;
    }
  }
}

function cleanJsonResponse(responseText) {
  if (responseText.startsWith("```json") && responseText.endsWith("```")) {
    // Extract the JSON string and trim any leading/trailing whitespace
    const jsonString = responseText
      .substring(7, responseText.length - 3)
      .trim();
    console.log(jsonString);
    return jsonString;
  } else {
    // If no delimiters, return the original string
    return responseText;
  }
}

module.exports = ResumeService;
