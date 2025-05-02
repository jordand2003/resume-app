const fs = require('fs').promises; // Use the promises API
const path = require('path');

const templatesFolderPath = path.join(__dirname, 'templates');

async function loadTemplates() {
    const plaintext_options = { template: {} };
    const markup_options = { template: {} };
    const html_options = { template: {} };
    const pdf_options = { style: {}, template: {} };

    try {
        const entries = await fs.readdir(templatesFolderPath);
        const subDirectories = entries.filter(async entry => { // Changed to async filter callback
            const entryPath = path.join(templatesFolderPath, entry);
            const stats = await fs.stat(entryPath); // Use await with fs.stat (returns a Promise)
            return stats.isDirectory();
        });

        const resolvedSubDirectories = await Promise.all(subDirectories); // Resolve the array of Promises

        await Promise.all(resolvedSubDirectories.map(async folderName => {
            const folderPath = path.join(templatesFolderPath, folderName);
            let currentDict;

            switch (folderName) {
                case "html":
                    currentDict = html_options.template;
                    break;
                case "markup":
                    currentDict = markup_options.template;
                    break;
                case "plaintext":
                    currentDict = plaintext_options.template;
                    break;
                default:
                    return;
            }

            const files = await fs.readdir(folderPath);
            await Promise.all(files.map(async file => {
                const filePath = path.join(folderPath, file);
                const data = await fs.readFile(filePath, 'utf8');
                const fileNameWithoutExtension = path.parse(file).name;
                currentDict[fileNameWithoutExtension] = data;
                console.log(`Stored ${fileNameWithoutExtension} content in ${folderName}`);
            }));
        }));

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