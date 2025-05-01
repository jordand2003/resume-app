const { plaintext_options, markup_options, pdf_options } = require("../options.js");
const { marked } = require('marked');
const mongoose = require("mongoose");


class FormattingService {

    /**
    * Returns the options object for a given file format type.
    *
    * @param {string} formatType - File type you want the options for
    * @returns {Object} - The corresponding options object contains dictionary
     */
    static optionsList(formatType){
        switch(formatType.toLocaleLowerCase()){
            case "plain-text":
                optionsArray = plaintext_options
                break;
            case "pdf":
                optionsArray = pdf_options
                break;
            default:    // markup
                optionsArray = markup_options
                break;
        }
        return optionsArray;
    }

     /**
     * Generates a plaintext resume from the provided resume content.
     *
     * This function takes resume data as input, populates a predefined plaintext template,
     * and conditionally removes section headers if the corresponding data is empty.
     *
     * @param {Object} resumeContent - An object containing the resume data, including:
     *   - summary: A string representing the resume summary.
     *   - skills: An array of strings representing the resume skills.
     *   - experience: An array of objects, where each object represents a job experience
     *     with properties like title, company, duration, and achievements.
     *   - education: An array of objects, where each object represents an education entry
     *     with properties like degree, institution, and year.
     * @returns {string} - A string containing the formatted plaintext resume.
     */
    static async plainTextResume(resumeContent){
        let response = plaintext_options.style.basic;

        // Populate Summary
        if(resumeContent.summary){  
            response = response.replace("{{summary}}", resumeContent.summary);
        } else{
            response = response.replace(/SUMMARY\n{{summary}}\n?/, "");
        }
        
        // Populate Skills
        if (resumeContent.skills && resumeContent.skills.length) {
            const skillList = resumeContent.skills.join(", ");                                  // MAKE AS Skills comma LIST
            //const skillList = resumeContent.skills.map(skill => `• ${skill}`).join('\n');    // MAKE AS bullet LIST
            response = response.replace("{{skills}}", skillList);
        } else {
            response = response.replace(/SKILLS\n{{skills}}\n?/, "");
        }

        // Populate Experience
        if (resumeContent.experience && resumeContent.experience.length) {
            const expList = resumeContent.experience.map(job => {
                const achievementsText = job.achievements.map(a => `\t\t• ${a}`).join('\n');
                return `${job.title}\n\t• ${job.company}\n\t• ${job.duration}\n${achievementsText}`;
            }).join('\n\n'); // Separate jobs with an extra newline

            response = response.replace("{{experience}}", expList);
        } else {
            response = response.replace(/EXPERIENCE\n{{experience}}\n?/, "");
        }

        // Populate Education
        if (resumeContent.education && resumeContent.education.length) {
            const eduList = resumeContent.education.map(edu => {
                return `${edu.degree}\n\t• ${edu.institution}\n\t• ${edu.year}`;
            }).join('\n\n');

            response = response.replace("{{education}}", eduList);
        } else {
            response = response.replace(/EDUCATION\n{{education}}\n?/, "");
        }

        // INCOMPLETE CERTIFICATIONS & AWARDS
        response = response.replace(/CERTIFICATIONS & AWARDS\n{{certifications\+awards}}\n?/, "");
        
        // INCOMPLETE PROJECTS
        response = response.replace(/PROJECTS\n{{projects}}\n?/, "");

        return response
    }

    /**
     * Generates an HTML resume from the provided resume content.
     *
     * @param {Object} resumeContent - An object containing the resume data, including:
     *   - summary: A string representing the resume summary.
     *   - skills: An array of strings representing the resume skills.
     *   - experience: An array of objects, where each object represents a job experience
     *     with properties like title, company, duration, and achievements.
     *   - education: An array of objects, where each object represents an education entry
     *     with properties like degree, institution, and year.
     * @param {string} style - Specificy what color style you want
     * @returns {string} - A string containing the formatted HTML resume.
     */
    static async htmlResume(resumeContent, style){
        // May replace later
        return marked.parse(this.markupResume(resumeContent, style))
    }

    /**
     * Generates a markup resume from the provided resume content.
     *
     * @param {Object} resumeContent - An object containing the resume data, including:
     *   - summary: A string representing the resume summary.
     *   - skills: An array of strings representing the resume skills.
     *   - experience: An array of objects, where each object represents a job experience
     *     with properties like title, company, duration, and achievements.
     *   - education: An array of objects, where each object represents an education entry
     *     with properties like degree, institution, and year.
     * @param {string} style - Specificy what color style you want
     * @returns {string} - A string containing the formatted markup resume.
     */
    static async markupResume(resumeContent, style){

        // Get markup style
        const selectedStyle = markup_options[style] || markup_options["basic"]; 
        
        let markdown = `# {{fullName}}\n#### {{position}}\n{{phoneNumber}}|{{emailAddress}}|{{websites}}\n\n{{Location}}\n`

        /// Populate Summary
        if (resumeContent.summary) {
            markdown += `## Summary\n${resumeContent.summary}\n\n`;
        }

        // Populate Skills
        if (resumeContent.skills && resumeContent.skills.length) {
            markdown += `## Skills\n${resumeContent.skills.map(skill => `* ${skill}`).join('\n')}\n\n`;
        }

        // Populate Experience
        if (resumeContent.experience && resumeContent.experience.length) {
            markdown += `## Experience\n`;
            resumeContent.experience.forEach(job => {
                markdown += `### ${job.title}\n`;
                markdown += `* **Company:** ${job.company}\n`;
                markdown += `* **Duration:** ${job.duration}\n`;
                if (job.achievements && job.achievements.length) {
                    markdown += `* **Achievements:**\n`;
                    job.achievements.forEach(achievement => {
                        markdown += `    * ${achievement}\n`;
                    });
                }
                markdown += `\n`;
            });
        }

        // Populate Education
        if (resumeContent.education && resumeContent.education.length) {
            markdown += `## Education\n`;
            resumeContent.education.forEach(edu => {
                markdown += `### ${edu.degree}\n`;
                markdown += `* **Institution:** ${edu.institution}\n`;
                markdown += `* **Year:** ${edu.year}\n`;
                markdown += `\n`;
            });
        }

        // INCOMPLETE CERTIFICATIONS & AWARDS
        if (resumeContent.certificationsAndAwards && resumeContent.certificationsAndAwards.length) {
            markdown += `## Certifications & Awards\n`;
            resumeContent.certificationsAndAwards.forEach(item => {
                markdown += `* ${item}\n`;
            });
            markdown += `\n`;
        }

        // INCOMPLETE PROJECTS
        if (resumeContent.projects && resumeContent.projects.length) {
            markdown += `## Projects\n`;
            resumeContent.projects.forEach(project => {
                markdown += `### ${project.name}\n`;
                markdown += `* ${project.description}\n`;
                // Add more project details as needed
                markdown += `\n`;
            });
        }

        // Return markup
        return markdown
    }
}

// Schema for formatted Content
const formattedContentSchema = new mongoose.Schema({
  "content": {
    type: String,
    required: true,
  },
  "fileType": {
    type: String,
    required: true,
  },
  "user_id": {
    type: String,
    required: true,
  },
  "resume_id": {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800 // 30 minutes
  },
});
const FormattedContent = mongoose.model('FormattedContent', formattedContentSchema);

// Export functions + module
module.exports = {
    optionsList: FormattingService.optionsList,
    plainTextResume: FormattingService.plainTextResume,
    markupResume: FormattingService.markupResume,
    FormattedContent
  };
  