"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiHumanizer = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const aiTools_model_1 = __importDefault(require("../models/aiTools.model"));
const openai_1 = __importDefault(require("openai"));
const getApiKey_1 = require("../utils/getApiKey");
// Handler to process text using the selected AI tool
exports.AiHumanizer = (0, express_async_handler_1.default)(async (req, res) => {
    const { text, tone, name, siteUrl } = req.body;
    // Validate input
    if (!name || name.trim().length === 0) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Tool name is required." });
        return;
    }
    if (text?.trim()?.length < 8) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Input text is too short or incorrect." });
        return;
    }
    if (siteUrl?.trim()?.length < 4) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Site URL is required." });
        return;
    }
    console.log(siteUrl);
    try {
        // Query MongoDB to find the AI tool by name
        const tool = await aiTools_model_1.default.findOne({ name });
        if (!tool) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: `Tool with name "${name}" not found.` });
            return;
        }
        let prompt = tool.prompt; // Extract the prompt from the database
        // Inject the tone into the prompt
        prompt = prompt.replace('${tone}', tone);
        const apiKey = await (0, getApiKey_1.getApiKeyBySiteUrl)(siteUrl);
        const openai = new openai_1.default({ apiKey: apiKey });
        // Use OpenAI with the retrieved prompt
        const completion = await openai.chat.completions.create({
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
        return;
    }
    catch (error) {
        console.error("Error processing AI humanizer request:", error);
        res.status(500).json({ error: "Failed to process the request with OpenAI." });
        return;
    }
});
