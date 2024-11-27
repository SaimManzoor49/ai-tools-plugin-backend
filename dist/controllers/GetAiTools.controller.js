"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAiTools = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const aiTools_model_1 = __importDefault(require("../models/aiTools.model"));
// Controller to get all AI tools and their prompts
exports.GetAiTools = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Fetch all tools from MongoDB
        const tools = await aiTools_model_1.default.find();
        if (tools.length === 0) {
            res.status(http_status_codes_1.StatusCodes.OK).send({
                message: "No AI tools found.",
                tools: [],
            });
            return;
        }
        // Return the tools as JSON
        res.status(http_status_codes_1.StatusCodes.OK).send({
            message: "AI tools retrieved successfully.",
            tools,
        });
    }
    catch (error) {
        console.error("Error retrieving AI tools:", error.message);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).send({
            error: "Failed to retrieve AI tools.",
        });
        return;
    }
});
