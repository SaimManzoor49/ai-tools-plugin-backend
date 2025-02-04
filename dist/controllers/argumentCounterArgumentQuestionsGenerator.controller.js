"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiArgumentCounterArgumentQuestionsGenerator = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const aiTools_model_1 = __importDefault(require("../models/aiTools.model"));
const openai_1 = __importDefault(require("openai"));
const getApiKey_1 = require("../utils/getApiKey");
// Handler to process text using the selected AI tool with streaming
exports.AiArgumentCounterArgumentQuestionsGenerator = (0, express_async_handler_1.default)(async (req, res) => {
    const { selectedType, // "Argument" or "Counterargument"
    mainClaim, // Only for Argument
    audience, // Only for Argument
    evidence, // Optional for Argument
    argument, // Only for Counterargument
    provideEvidence, // Only for Counterargument ("Yes" or "No")
    additionalContextCounter, // Only for Counterargument (optional)
    tone, // Tone for both types
    additionalContext = 'no additional instructions', // For Argument (optional)
    name, siteUrl } = req.body;
    // Basic validations for common fields
    if (!name || name.trim().length === 0) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Tool name is required." });
        return;
    }
    if (!siteUrl || siteUrl.trim().length < 4) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Site URL is required." });
        return;
    }
    if (!selectedType || !selectedType.trim().length) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Please specify the selected type (Argument or Counterargument)." });
        return;
    }
    if (!tone || !tone.trim().length) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Please specify the tone." });
        return;
    }
    // Conditional validations based on selectedType
    if (selectedType === "Argument") {
        if (!mainClaim || !mainClaim.trim().length) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Please specify the main claim or statement." });
            return;
        }
        if (!audience || !audience.trim().length) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Please specify the target audience." });
            return;
        }
        // 'evidence' is optional. If not provided, the prompt instructs the tool to generate examples.
    }
    else if (selectedType === "Counterargument") {
        if (!argument || !argument.trim().length) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Please specify the argument to respond to." });
            return;
        }
        if (!provideEvidence || !provideEvidence.trim().length) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Please specify whether to provide evidence/examples (Yes or No)." });
            return;
        }
        // additionalContextCounter is optional.
    }
    else {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Invalid selected type. Must be 'Argument' or 'Counterargument'." });
        return;
    }
    try {
        // Query MongoDB to find the AI tool by name
        const tool = await aiTools_model_1.default.findOne({ name });
        if (!tool) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: `Tool with name "${name}" not found.` });
            return;
        }
        // Retrieve the prompt template stored in the database.
        // The template should include placeholders like ${selectedType}, ${mainClaim}, ${audience},
        // ${evidence}, ${argument}, ${provideEvidence}, ${additionalContextCounter}, ${tone}, and ${additionalContext}
        let prompt = tool.prompt;
        // Prepare dynamic variables for both cases.
        // For any fields not applicable to a given type, the value can be an empty string.
        const dynamicVariables = {
            selectedType,
            mainClaim: mainClaim || "",
            audience: audience || "",
            evidence: evidence || "",
            argument: argument || "",
            provideEvidence: provideEvidence || "",
            additionalContextCounter: additionalContextCounter || "",
            tone,
            additionalContext
        };
        // Replace each placeholder with its corresponding value
        for (let [key, value] of Object.entries(dynamicVariables)) {
            const regex = new RegExp(`\\\${${key}}`, "g");
            prompt = prompt.replace(regex, value);
        }
        // Retrieve API key based on siteUrl
        const apiKey = await (0, getApiKey_1.getApiKeyBySiteUrl)(siteUrl);
        const openai = new openai_1.default({ apiKey });
        // Set headers for a streamed response
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        // Create a streaming completion using the unified prompt
        const stream = await openai.chat.completions.create({
            model: tool.modelName,
            messages: [
                {
                    role: "system",
                    content: `You are a creative and analytical writing assistant.`,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            stream: true,
        });
        // Stream response data to the client
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                res.write(`${content}`);
            }
        }
        // Signal the end of the stream
        res.write("data: [DONE]\n\n");
        res.end();
    }
    catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: error?.message || "Failed to process the request with OpenAI." });
    }
});
