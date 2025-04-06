const resumeUpload = require("./resumeUpload")

let filePathDocx = "C:\\Users\\proga\\Documents\\Mr. Professional Man\\Word Variants\\Fall 2024 Resume.docx"
let filePathPdf = "C:\\Users\\proga\\Documents\\Mr. Professional Man\\Saied Resume v2.pdf"

resumeUpload(filePathDocx)
    .then(res => {
        console.log("Test for Resume: ", res); 
        // pass res into a save function (n/a/)
    })