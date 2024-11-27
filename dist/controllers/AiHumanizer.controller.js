"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiHumanizer = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
exports.AiHumanizer = (0, express_async_handler_1.default)(async (req, res) => {
    const { text, tone, name } = req.body;
    if (!name || name.trim().length === 0) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Tool name is required." });
        return;
    }
    if (text?.trim()?.length < 8) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Input text is not correct or too short." });
        return;
    }
    const dbPath = path_1.default.join('/tmp', 'database.db');
    const db = new sqlite3_1.default.Database(dbPath, (err) => {
        if (err) {
            console.error("Error connecting to the database:", err.message);
            res.status(500).json({ error: "Failed to connect to the database." });
            return;
        }
    });
    // Query to get the prompt for the provided tool name
    const getPromptSQL = `
    SELECT prompt FROM ai_tools WHERE name = ?;
  `;
    db.get(getPromptSQL, [name], async (err, row) => {
        if (err) {
            console.error("Error querying the database:", err.message);
            res.status(500).json({ error: "Failed to retrieve prompt from the database." });
            return;
        }
        if (!row) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: `Tool with name "${name}" not found.` });
            return;
        }
        let prompt = row.prompt; // Extract the prompt from the result
        try {
            const temp = prompt.split('${tone}');
            prompt = temp[0] + `${tone}` + temp[1];
            // Use global.openai with the retrieved prompt
            const completion = await global.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: prompt,
                    },
                    {
                        role: "user",
                        content: text,
                    },
                ],
            });
            res.status(200).json({ response: completion.choices[0].message.content });
        }
        catch (error) {
            console.error("Error generating OpenAI completion:", error);
            res.status(500).json({ error: "Failed to generate completion using OpenAI." });
        }
        finally {
            // Close the database connection
            db.close((err) => {
                if (err) {
                    console.error("Error closing the database:", err.message);
                }
            });
        }
    });
});
