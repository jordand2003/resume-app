const { GoogleGenerativeAI } = require("@google/generative-ai");
const JobDesc = require("../models/JobDesc");
const { ResumeData } = require("./structuredDataService");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class JobAdviceService {
  static async generateAdvice(jobId, resumeId) {
    try {
      // Get job description
      const jobDesc = await JobDesc.findById(jobId);
      if (!jobDesc) {
        throw new Error("Job description not found");
      }

      // Get resume data
      const resumeData = await ResumeData.findById(resumeId);
      if (!resumeData) {
        throw new Error("Resume data not found");
      }

      // Construct AI prompt
      const prompt = this.constructAIPrompt(jobDesc, resumeData);

      // Call Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;

      if (!response || !response.text) {
        throw new Error("Failed to get a valid response from the AI.");
      }

      return response.text();
    } catch (error) {
      console.error("Error generating job advice:", error);
      throw error;
    }
  }

  static constructAIPrompt(jobDesc, resumeData) {
    return `Analyze this job description and resume to provide personalized advice for improving the candidate's chances of landing this job.

Job Description:
Company: ${jobDesc.company}
Position: ${jobDesc.job_title}
Description: ${jobDesc.description}

Resume Content:
${JSON.stringify(resumeData.parsedData, null, 2)}

Please provide detailed advice in the following format:

1. Resume Match Analysis:
   - How well does the resume match the job requirements?
   - What key skills or experiences are missing?
   - What strengths should be highlighted more?

2. Improvement Suggestions:
   - Specific content additions or modifications
   - Formatting or presentation improvements
   - Keywords to include

3. Interview Preparation Tips:
   - Key points to emphasize in interviews
   - Potential questions to prepare for
   - Areas to research about the company

Provide actionable, specific advice that will help the candidate improve their chances of getting this job.`;
  }
}

module.exports = JobAdviceService;
