const fs = require('fs').promises;
const path = require('path');

const templatesFolderPath = path.join(__dirname, 'templates');

// Special function to read from the HTML folder
async function handleHtmlTemplates(folderPath, html_options) {
    const htmlSubFolders = await fs.readdir(folderPath);

    // Search each subfolder
    await Promise.all(htmlSubFolders.map(async subFolderName => {
        const subFolderPath = path.join(folderPath, subFolderName);
        const subFolderStats = await fs.stat(subFolderPath);

        if (subFolderStats.isDirectory()) { // ensures immediate files in html are skipped
            const files = await fs.readdir(subFolderPath);
            let htmlFile = null;
            const styles = {};

            // Find all HTML and CSS files
            await Promise.all(files.map(async file => {
                const filePath = path.join(subFolderPath, file);
                const fileExtension = path.extname(file).toLowerCase();
                const fileContent = await fs.readFile(filePath, 'utf8');

                if (fileExtension === '.html') {
                    htmlFile = fileContent;
                } else if (fileExtension === '.css') {
                    const fileNameWithoutExtension = path.parse(file).name;
                    styles[fileNameWithoutExtension] = fileContent;
                }
            }));

            // Store HTML and CSS
            if (htmlFile) {
                html_options.template[subFolderName] = htmlFile; // Store HTML content
                html_options.style[subFolderName] = styles; // Store CSS styles
                //console.log(`Stored ${fileNameWithoutExtension} content in html_options`);
            }
        }
    }));
}

// Reads all files in the templates directory
async function loadTemplates() {
    const plaintext_options = { template: {} };
    const markup_options = { template: {} };
    const html_options = { template: {}, style: {} };
    const pdf_options = { template: {}, style: {},  };

    try {
        const entries = await fs.readdir(templatesFolderPath);
        const subDirectories = entries.filter(async entry => { 
            const entryPath = path.join(templatesFolderPath, entry);
            const stats = await fs.stat(entryPath); //(returns a Promise)
            return stats.isDirectory();
        });

        const resolvedSubDirectories = await Promise.all(subDirectories); // Resolve the array of Promises

        // Process each folder's files and store templates (html, markup, plaintext)
        await Promise.all(resolvedSubDirectories.map(async folderName => {
            const folderPath = path.join(templatesFolderPath, folderName);
            let currentDict;

            // select object/dictionary to populate
            switch (folderName) {
                case "html":
                    //currentDict = html_options.template;
                    //break;
                    handleHtmlTemplates(folderPath, html_options)
                    return
                case "markup":
                    currentDict = markup_options.template;
                    break;
                case "plaintext":
                    currentDict = plaintext_options.template;
                    break;
                default:
                    return;
            }

            // Loop through folder in folderPath
            const files = await fs.readdir(folderPath);
            await Promise.all(files.map(async file => {
                const filePath = path.join(folderPath, file);
                const data = await fs.readFile(filePath, 'utf8');
                const fileNameWithoutExtension = path.parse(file).name;
                currentDict[fileNameWithoutExtension] = data;
                console.log(`Stored ${fileNameWithoutExtension} content in ${folderName}_options`);
            }));
        }));

        // Return populated options
        return {
            plaintext_options: plaintext_options,
            markup_options: markup_options,
            html_options: html_options,
            pdf_options: pdf_options
        };

    } catch (err) {
        console.error('Error loading templates:', err);
        throw err; // Re-throw the error to be handled by the caller
    }
}

module.exports = { loadTemplates };