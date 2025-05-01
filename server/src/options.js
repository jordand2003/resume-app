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
let basicMarkup = `
# {{name}}
#### {{position}}
{{phoneNumber}}|{{emailAddress}}|{{websites}}

{{Location}}
## Summary
{{summary}}

## Skills
{{skills}}

## Experience
{{experience}}

## Education
{{education}}
`

// HTML Templates
let basicHTML = `
<h1>{{fullName}}</h1>
    <h2>{{position}}</h2>
    <p>{{Location}}
    {{phoneNumber}}|{{emailAddress}}|{{websites}}
<h2>Summary</h2>
    {{summary}}
<h2>Skills</h2>
    {{skills}}
<h2>Experience</h2>
    {{experience}}
<h2>Education</h2>
    {{education}}
`

// Exported constants
module.exports = {
    plaintext_options: {template: {basic:plainTextTemplate}},
    markup_options: {template: {basic: basicMarkup}},
    html_options: {style: {}, template: {basic: basicHTML}},
    pdf_options: {"style": {}, template: {}}
};