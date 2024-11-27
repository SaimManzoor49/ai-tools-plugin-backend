"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testKey = exports.changeApiKey = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const openai_1 = require("openai"); // Import OpenAI client
// Initialize SQLite Database
const dbPath = path_1.default.resolve('/tmp', 'database.db');
const db = new sqlite3_1.default.Database(dbPath);
// Create table for storing API key (if not exists)
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS api_keys (id INTEGER PRIMARY KEY AUTOINCREMENT, apiKey TEXT)");
});
// Change API key handler
exports.changeApiKey = (0, express_async_handler_1.default)(async (req, res) => {
    const { apiKey } = req.body;
    // Validate the API key
    if (!apiKey?.trim() || apiKey.trim().length < 8) {
        res.status(400).json({ response: "Please provide a valid key." });
        return;
    }
    try {
        // Check if there's already a key in the database
        db.get("SELECT apiKey FROM api_keys WHERE id = 1", (err, row) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ response: "Database error." });
            }
            // If key exists, update it, else insert the new key
            if (row) {
                // Update existing key
                db.run("UPDATE api_keys SET apiKey = ? WHERE id = 1", [apiKey], (updateErr) => {
                    if (updateErr) {
                        console.error("Error updating API key:", updateErr);
                        return res.status(500).json({ response: "Failed to update the key." });
                    }
                    // Re-initialize the OpenAI client with the new key
                    reinitializeOpenAI(apiKey);
                    return res.status(200).json({ response: "Key updated successfully." });
                });
            }
            else {
                // Insert new key if none exists
                db.run("INSERT INTO api_keys (apiKey) VALUES (?)", [apiKey], (insertErr) => {
                    if (insertErr) {
                        console.error("Error inserting API key:", insertErr);
                        return res.status(500).json({ response: "Failed to save the key." });
                    }
                    // Re-initialize the OpenAI client with the new key
                    reinitializeOpenAI(apiKey);
                    return res.status(200).json({ response: "Key saved successfully." });
                });
            }
        });
    }
    catch (error) {
        console.error("Error updating key:", error);
        res.status(500).json({ response: "Failed to update the key." });
    }
});
exports.testKey = (0, express_async_handler_1.default)(async (req, res) => {
    const { apiKey } = req.body;
    const openai = new openai_1.OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "you are a helper and only response with ok not even a single char other then that",
            },
            {
                role: "user",
                content: 'test',
            },
        ],
    });
    res.status(200).json({ response: completion.choices[0].message.content });
});
// Function to reinitialize the OpenAI client
function reinitializeOpenAI(apiKey) {
    try {
        const openai = new openai_1.OpenAI({
            apiKey: apiKey,
        });
        // Assign OpenAI client to global object
        global.openai = openai; // Type assertion to avoid TypeScript issues
        console.log("OpenAI client reinitialized with new API key.");
    }
    catch (error) {
        console.error("Error initializing OpenAI client:", error);
    }
}
