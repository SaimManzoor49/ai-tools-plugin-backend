"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testKey = exports.changeApiKey = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const openai_1 = require("openai"); // Import OpenAI client
const apiKey_model_1 = __importDefault(require("../models/apiKey.model"));
// Handler to change the API key
exports.changeApiKey = (0, express_async_handler_1.default)(async (req, res) => {
    const { apiKey } = req.body;
    // Validate the API key
    if (!apiKey?.trim() || apiKey.trim().length < 8) {
        res.status(400).json({ response: "Please provide a valid key." });
        return;
    }
    try {
        // Check if an API key exists
        const existingKey = await apiKey_model_1.default.findOne();
        if (existingKey) {
            // Update the existing API key
            existingKey.apiKey = apiKey;
            await existingKey.save();
            // Reinitialize OpenAI with the new key
            reinitializeOpenAI(apiKey);
            res.status(200).json({ response: "Key updated successfully." });
            return;
        }
        else {
            // Insert a new API key
            const newKey = new apiKey_model_1.default({ apiKey });
            await newKey.save();
            // Reinitialize OpenAI with the new key
            reinitializeOpenAI(apiKey);
            res.status(200).json({ response: "Key saved successfully." });
            return;
        }
    }
    catch (error) {
        console.error("Error updating API key:", error);
        res.status(500).json({ response: "Failed to update the key." });
    }
});
// Handler to test the API key with OpenAI
exports.testKey = (0, express_async_handler_1.default)(async (req, res) => {
    const { apiKey } = req.body;
    try {
        const openai = new openai_1.OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helper and only respond with 'ok'. No additional text is allowed.",
                },
                {
                    role: "user",
                    content: "test",
                },
            ],
        });
        res.status(200).json({ response: completion.choices[0].message.content });
        return;
    }
    catch (error) {
        console.error("Error testing API key:", error);
        res.status(500).json({ response: "Failed to test the API key." });
        return;
    }
});
// Function to reinitialize the OpenAI client
function reinitializeOpenAI(apiKey) {
    try {
        const openai = new openai_1.OpenAI({ apiKey });
        // Assign OpenAI client to the global object
        global.openai = openai;
        console.log("OpenAI client reinitialized with new API key.");
    }
    catch (error) {
        console.error("Error initializing OpenAI client:", error);
    }
}
