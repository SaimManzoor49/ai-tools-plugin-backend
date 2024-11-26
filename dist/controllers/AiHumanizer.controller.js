"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiHumanizer = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const openai_1 = __importDefault(require("openai"));
exports.AiHumanizer = (0, express_async_handler_1.default)(async (req, res) => {
    const { text, tone } = req.body;
    if (text?.trim()?.length < 8) {
        res.status(400).json({ response: 'Input text is not correct or too short.' });
    }
    const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: `You are a helpful assistant specializing in rewriting text to make it sound more human and natural. When provided with robotic or AI-generated text, refine it to read as if written by a person, using a ${tone} tone and natural phrasing. Your response will only include the processed text, with no additional characters or explanations. if the given text(prompt) is not correct response with please provide correct text.` },
            {
                role: "user",
                content: text,
            },
        ],
    });
    res.status(200).json({ response: completion.choices[0].message });
});
