"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiRhetoricalAnalysisGenerator = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const aiTools_model_1 = __importDefault(require("../models/aiTools.model"));
const openai_1 = __importDefault(require("openai"));
const getApiKey_1 = require("../utils/getApiKey");
// Handler to process text using the selected AI tool with streaming
exports.AiRhetoricalAnalysisGenerator = (0, express_async_handler_1.default)(async (req, res) => {
    const { text, analysisDepth, tone, additionalInstructions = 'no additional instructions', name, siteUrl } = req.body;
    // Validate input
    if (!name || name.trim().length === 0) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Tool name is required." });
        return;
    }
    if (siteUrl?.trim()?.length < 4) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Site URL is required." });
        return;
    }
    if (!text?.trim().length) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Please provide the text." });
        return;
    }
    if (!analysisDepth?.trim().length) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Please specify analysis depth." });
        return;
    }
    if (!tone?.trim().length) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Please specify tone." });
        return;
    }
    try {
        // Query MongoDB to find the AI tool by name
        const tool = await aiTools_model_1.default.findOne({ name });
        if (!tool) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: `Tool with name "${name}" not found.` });
            return;
        }
        let prompt = tool.prompt; // Extract the prompt from the database
        const dynamicVariables = {
            text, analysisDepth, tone, additionalInstructions
        };
        // Replace all variables dynamically
        for (let [key, value] of Object.entries(dynamicVariables)) {
            const regex = new RegExp(`\\\${${key}}`, 'g');
            prompt = prompt.replace(regex, value);
        }
        const apiKey = await (0, getApiKey_1.getApiKeyBySiteUrl)(siteUrl);
        const openai = new openai_1.default({ apiKey: apiKey });
        // Set headers for a streamed response
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        const stream = await openai.chat.completions.create({
            model: tool?.modelName,
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
            stream: true,
        });
        // Stream response data to the client
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                res.write(`${content}`); // Write data to the response
            }
        }
        // End the stream
        res.write("data: [DONE]\n\n");
        res.end();
    }
    catch (error) {
        console.error("Error processing AI Debate Craft request:", error);
        res.status(500).json({ error: error?.message || "Failed to process the request with OpenAI." });
    }
});
