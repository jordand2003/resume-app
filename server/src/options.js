// PDF Templates
let plainTextTemplate = `
        INFO
        {{fullName}}
        {{position}}
        {{Location}}
        {{phoneNumber}}
        {{emailAddress}}
        {{websites}}
        
        SUMMARY
        {{summary}}
        
        SKILLS
        {{skills}}
        
        EXPERIENCE
        {{experience}}

        
        EDUCATION
        {{education}}
        
        
        CERTIFICATIONS & AWARDS
        {{certifications+awards}}
        
        PROJECTS
        {{projects}}
`

// Markup Templates
let basicMarkup = ``


// Exported constants
module.exports = {
    plaintext_options: {"style": {basic:plainTextTemplate}},
    markup_options: {"style": {basic: {}}},
    pdf_options: {"style": {}, "template": {}}
};