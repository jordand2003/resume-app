const express  = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { GoogleGenAI, Type } = require("@google/genai");

// Missing: userid, and save function.
// Userid should be extracted from JWT token, but I don't know how it will be donw
// Save function is Jordan's work

// Template GET api for Retreive Stored Career History
router.get("/history", async (req, res) => {
    try {
        const db = mongoose.connection.useDb('Career', {
            // `useCache` tells Mongoose to cache connections by database name, so
            // `mongoose.connection.useDb('foo', { useCache: true })` returns the
            // same reference each time.
            useCache: true
        });
        const { userid } = req.params;
        const cursor = db.find({ userid: userid });
        res.status(200).json({
            message: ""
        })
    } catch (error) {
        console.error("Retreive Career History error:", error);
        res.status(500).json({
            message: "Retrieve Stored Career History failed"
        });
    }
});

// Nearly complete POST api for Career History
// Needs userid and save function
router.post("/history", async (req, res) => {
    try {
        const text = req.body;
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const prompt = `Extract the career history from the given text and return a json file. 
                        In the case where there is insufficient information to fill an entry e.g. 'Title', 'Company', 'Start Date', etc., leave the entry blank.`
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: text,
            config: {
                systemInstruction: prompt,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            'Title': {
                                type: Type.STRING,
                                description: "The official job title held by the user during this employment period, e.g., 'Senior Software Engineer', 'Marketing Manager'.",
                                nullable: false,
                            },
                            'Company': {
                                type: Type.STRING,
                                description: "The name of the company or organization where the user worked, e.g., 'Google', 'Acme Corp'.",
                                nullable: false
                            },
                            'Location': {
                                tpye: Type.STRING,
                                description: "The location where the user worked.",
                                nullable: false
                            },
                            'Start Date': {
                                type: Type.STRING,
                                description: "The month and year (or year if month is unavailable) when the user began this job. Format can vary, e.g., 'June 2020', '2020'.",
                                nullable: false
                            },
                            'End Date': {
                                type: Type.STRING,
                                description: "The month and year (or year) when the user left this position. If still employed, this can be 'Present'",
                                nullable: false,
                            },
                            'Responsibility': {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.STRING,
                                    description: "A key responsibility the user had during this job. Each entry should be a clear, concise bullet point describing a specific duty.",
                                    nullable: false
                                }
                            }
                        },
                        required: ['Title', 'Company', 'Location', 'Start Date', 'End Date', 'Responsibility'],
                    }
                }
            }
        });
        const json_text = JSON.parse(response.text);
        const filtered_json = json_text.filter(item => item.Title !== '' && item.Company !== '');
        if (filtered_json.length === 0)
            throw "Insufficient Data";
        console.log(filtered_json);
        // call Save structured data from content function here 
        // ...
        // Save structured data from content should return id of saved text
        const newID = "";
        res.status(200).json({
            historyId: newID,
            Status: "Saved"
        });
    } catch (error) {
        console.error("Submit Free-Form History error:", error);
        if (error === "Insufficient Data")
            res.status(400).json({
                historyId: "-1",
                Status: "Failed",
                message: "Invalid Career History given. Try again."
            });
        else
            res.status(500).json({
                historyId: "-1",
                Status: "Failed",
                message: "Submit Free-Form History failed due to internal error.",
            });
    }
});

// Export for server.js
module.exports = router;