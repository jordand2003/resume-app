const { loadTemplates } = require("../options.js");
const mongoose = require("mongoose");

let plaintext_options;
let markup_options;
let html_options;
let pdf_options;

// Immediately invoke to load templates
loadTemplates()
  .then(loadedOptions => {
    plaintext_options = loadedOptions.plaintext_options;
    markup_options = loadedOptions.markup_options;
    html_options = loadedOptions.html_options;
    pdf_options = loadedOptions.pdf_options;
    console.log('Templates loaded successfully in FormattingService!');
  })
  .catch(error => {
    console.error('Error loading templates in FormattingService:', error);
    // Handle the error appropriately, perhaps by setting default templates or exiting the application
  });

class FormattingService {
  /**
   * Returns the options object for a given file format type.
   *
   * @param {string} formatType - File type you want the options for
   * @returns {Object} - The corresponding options object contains dictionary
   */
    static optionsList(formatType) { // Make it a static method
        switch (formatType.toLocaleLowerCase()) {
        case "plaintext":
            return plaintext_options;
        case "pdf":
            return pdf_options;
        case "html":
            return html_options;
        default: // markup
            return markup_options;
        }
    }

    /*
    * Returns the options object for all types.
    */
    static allOptions() {
        return {plaintext: plaintext_options, pdf: pdf_options, markup: markup_options}
    }


    static async latexResume(resumeContent){
        
    }

  /**
   * Generates a plaintext resume from the provided resume content.
   *
   * This function takes resume data as input, populates a predefined plaintext template,
   * and conditionally removes section headers if the corresponding data is empty.
   *
   * @param {Object} resumeContent - An object containing the resume data, including:
   * - summary: A string representing the resume summary.
   * - skills: An array of strings representing the resume skills.
   * - experience: An array of objects, where each object represents a job experience
   * with properties like title, company, duration, and achievements.
   * - education: An array of objects, where each object represents an education entry
   * with properties like degree, institution, and year.
   * @returns {string} - A string containing the formatted plaintext resume.
   */
  static async plainTextResume(resumeContent) {
    // Ensure plaintext_options is loaded before using it
    if (!plaintext_options || !plaintext_options.template || !plaintext_options.template.basic) {
      console.warn('Plaintext template not yet loaded.');
      return ''; // Or handle this case as needed
    }
    let response = plaintext_options.template.basic; // Access the template from the loaded options

    // Populate Summary
    if (resumeContent.summary) {
      response = response.replace("{{summary}}", resumeContent.summary);
    } else {
      response = response.replace(/SUMMARY\s*\r?\n\s*\{\{summary\}\}\s*/g, "");
    }

    // Populate Skills
    if (resumeContent.skills && resumeContent.skills.length) {
      const skillList = resumeContent.skills.join(", ");
      response = response.replace("{{skills}}", skillList);
    } else {
      response = response.replace(/SKILLS\s*\r?\n\s*\{\{skills\}\}\s*/g, "");
    }

    // Populate Experience
    if (resumeContent.experience && resumeContent.experience.length) {
      const expList = resumeContent.experience.map(job => {
        const achievementsText = job.achievements.map(a => `\t\t• ${a}`).join('\n');
        return `${job.title}\n\t• ${job.company}\n\t• ${job.duration}\n${achievementsText}`;
      }).join('\n\n'); // Separate jobs with an extra newline

      response = response.replace("{{experience}}", expList);
    } else {
      response = response.replace(/EXPERIENCE\s*\r?\n\s*\{\{experience\}\}\s*/g, "");
    }

    // Populate Education
    if (resumeContent.education && resumeContent.education.length) {
      const eduList = resumeContent.education.map(edu => {
        return `${edu.degree}\n\t• ${edu.institution}\n\t• ${edu.year}`;
      }).join('\n\n');

      response = response.replace("{{education}}", eduList);
    } else {
      response = response.replace(/EDUCATION\s*\r?\n\s*\{\{education\}\}\s*/g, "");
    }

    // INCOMPLETE CERTIFICATIONS & AWARDS
    response = response.replace(/CERTIFICATIONS & AWARDS\s*\r?\n\s*\{\{certifications\+awards\}\}\s*/g, "");

    // INCOMPLETE PROJECTS
    response = response.replace(/PROJECTS\s*\r?\n\s*\{\{projects\}\}\s*/g, "");

    return response;
  }

  /**
   * Generates an HTML resume from the provided resume content.
   *
   * @param {Object} resumeContent - An object containing the resume data, including:
   * - summary: A string representing the resume summary.
   * - skills: An array of strings representing the resume skills.
   * - experience: An array of objects, where each object represents a job experience
   * with properties like title, company, duration, and achievements.
   * - education: An array of objects, where each object represents an education entry
   * with properties like degree, institution, and year.
   * @param {string} template - Optional: Key value specifiying what color template you want (Uses basic template if not specified)
   * @param {string} style - Optional: Key value that specifiying the style you'll choose (Uses default style if not specified)
   * @returns {string} - A string containing the formatted HTML resume.
   */
  static async htmlResume(resumeContent, template, style) {
    if (!html_options || !html_options.template) {
      console.warn('HTML templates not yet loaded.');
      return '';
    }
    // Get html template
    const selectedTemplate = html_options.template[template] || html_options.template["basic"];
    let html = selectedTemplate;

    // Get style (if not specified use default style)
    const selectedStyle =  html_options['style'][template][style] || html_options['style'][template]['default']
    html = html.replace("/*{{style}}*/", selectedStyle)

    /// Populate Summary
    if (resumeContent.summary) {
      html = html.replace('{{summary}}', resumeContent.summary);
    } else {
      html = html.replace('##Summary\n{{summary}}\n\n', ''); // Remove section if no summary
    }

    // Replace skills
    if (resumeContent.skills && resumeContent.skills.length) {
      const skillsList = resumeContent.skills.map(skill => `<li>${skill}</li>`).join('');
      html = html.replace('{{skills}}', `<ul>${skillsList}</ul>`);
    } else {
      html = html.replace('<h2>Skills</h2>\n{{skills}}', ''); // Remove section if no skills
    }

    // Replace experience
    if (resumeContent.experience && resumeContent.experience.length) {
      let experienceEntries = '';
      resumeContent.experience.forEach(job => {
        experienceEntries += `<h3>${job.title}</h3>\n`;
        experienceEntries += `<p><strong>Company:</strong> ${job.company}</p>\n`;
        experienceEntries += `<p><strong>Duration:</strong> ${job.duration}</p>\n`;
        if (job.achievements && job.achievements.length) {
          experienceEntries += `<p><strong>Achievements:</strong></p>\n<ul>\n`;
          job.achievements.forEach(achievement => {
            experienceEntries += `<li>${achievement}</li>\n`;
          });
          experienceEntries += `</ul>\n`;
        }
        experienceEntries += `\n`;
      });
      html = html.replace('{{experience}}', experienceEntries);
    } else {
      html = html.replace('<h2>Experience</h2>\n{{experience}}', ''); // Remove section if no experience
    }

    // Replace education
    if (resumeContent.education && resumeContent.education.length) {
      let educationEntries = '';
      resumeContent.education.forEach(edu => {
        educationEntries += `<h3>${edu.degree}</h3>\n`;
        educationEntries += `<p><strong>Institution:</strong> ${edu.institution}</p>\n`;
        educationEntries += `<p><strong>Year:</strong> ${edu.year}</p>\n\n`;
      });
      html = html.replace('{{education}}', educationEntries);
    } else {
      html = html.replace('<h2>Education</h2>\n{{education}}', ''); // Remove section if no education
    }

    // INCOMPLETE CERTIFICATIONS & AWARDS

    // INCOMPLETE PROJECTS

    return html;
  }

  /**
   * Generates a markup resume from the provided resume content.
   *
   * @param {Object} resumeContent - An object containing the resume data, including:
   * - summary: A string representing the resume summary.
   * - skills: An array of strings representing the resume skills.
   * - experience: An array of objects, where each object represents a job experience
   * with properties like title, company, duration, and achievements.
   * - education: An array of objects, where each object represents an education entry
   * with properties like degree, institution, and year.
   * @param {string} template - Specificy what color style you want
   * @returns {string} - A string containing the formatted markup resume.
   */
  static async markupResume(resumeContent, template) {
    if (!markup_options || !markup_options.template) {
      console.warn('Markup templates not yet loaded.');
      return '';
    }
    // Get markup template
    const selectedTemplate = markup_options.template[template] || markup_options.template["basic"];
    let markdown = selectedTemplate;

    /// Populate Summary
    if (resumeContent.summary) {
      markdown = markdown.replace('{{summary}}', resumeContent.summary);
    } else {
      markdown = markdown.replace('##Summary\n{{summary}}\n\n', ''); // Remove section if no summary
    }

    // Populate skills
    if (resumeContent.skills && resumeContent.skills.length) {
      const skillsText = resumeContent.skills.map(skill => `* ${skill}`).join('\n');
      markdown = markdown.replace('{{skills}}', skillsText);
    } else {
      markdown = markdown.replace('## Skills\n{{skills}}\n\n', ''); // Remove section if no skills
    }

    // Populate Experience
  if (resumeContent.experience && resumeContent.experience.length) {
    let experienceText = '';
    resumeContent.experience.forEach(job => {
      experienceText += `### ${job.title}\n`;
      experienceText += `* **Company:** ${job.company}\n`;
      experienceText += `* **Duration:** ${job.duration}\n`;
      if (job.achievements && job.achievements.length) {
        experienceText += `* **Achievements:**\n`;
        job.achievements.forEach(achievement => {
          experienceText += `  * ${achievement}\n`;
        });
      }
      experienceText += `\n`;
    });
    markdown = markdown.replace('{{experience}}', experienceText);
  } else {
    markdown = markdown.replace(/## Experience\n{{experience}}\n\n?/, '');
  }

  // Populate Education
  if (resumeContent.education && resumeContent.education.length) {
    const educationText = resumeContent.education.map(edu => (
      `### ${edu.degree}\n* **Institution:** ${edu.institution}\n* **Year:** ${edu.year}`
    )).join('\n\n');
    markdown = markdown.replace('{{education}}', educationText);
  } else {
    markdown = markdown.replace(/## Education\n{{education}}\n\n?/, '');
  }

  // Populate Certifications & Awards
  if (resumeContent.certificationsAndAwards && resumeContent.certificationsAndAwards.length) {
    const certText = resumeContent.certificationsAndAwards.map(item => `* ${item}`).join('\n');
    markdown = markdown.replace('{{certificationsAndAwards}}', certText);
  } else {
    markdown = markdown.replace(/## Certifications & Awards\n{{certificationsAndAwards}}\n\n?/, '');
  }

  // Populate Projects
  if (resumeContent.projects && resumeContent.projects.length) {
    const projectsText = resumeContent.projects.map(project =>
      `### ${project.name}\n* ${project.description}`
    ).join('\n\n');
    markdown = markdown.replace('{{projects}}', projectsText);
  } else {
    markdown = markdown.replace(/## Projects\n{{projects}}\n\n?/, '');
  }

    return markdown;
  }
}

// Schema for formatted Content
const formattedContentSchema = new mongoose.Schema({
  "content": {
    type: String,
    required: true,
  },
  "file": {
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
  lastUsed_templateId: {
    type: String,
    default: "basic",
    required: false,
  },
  lastUsed_styleId: {
    type: String,
    default: "default",
    required: false,
  }
});
const FormattedContent = mongoose.model('FormattedContent', formattedContentSchema);

// Export functions + module
module.exports = {
  optionsList: FormattingService.optionsList,
  allOptions: FormattingService.allOptions,
  plainTextResume: FormattingService.plainTextResume,
  markupResume: FormattingService.markupResume,
  htmlResume: FormattingService.htmlResume,
  latexResume: FormattingService.latexResume,
  FormattedContent
};