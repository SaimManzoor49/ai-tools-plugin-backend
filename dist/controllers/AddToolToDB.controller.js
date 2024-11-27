"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddToolToDb = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const aiTools_model_1 = __importDefault(require("../models/aiTools.model"));
// Controller to add or update an AI tool
exports.AddToolToDb = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, prompt } = req.body;
    // Validate input
    if (!name || !prompt) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).send({
            error: "Tool name and prompt are required.",
        });
        return;
    }
    try {
        // Check if the tool already exists
        const existingTool = await aiTools_model_1.default.findOne({ name });
        if (existingTool) {
            // If the tool exists, update its prompt
            existingTool.prompt = prompt;
            await existingTool.save();
            res.status(http_status_codes_1.StatusCodes.OK).send({
                message: "Tool prompt updated successfully.",
                toolName: name,
            });
            return;
        }
        // If the tool does not exist, create a new one
        const newTool = new aiTools_model_1.default({ name, prompt });
        await newTool.save();
        res.status(http_status_codes_1.StatusCodes.CREATED).send({
            message: "New tool added successfully.",
            toolId: newTool._id,
        });
    }
    catch (error) {
        console.error("Error adding/updating AI tool:", error?.message);
        // Handle MongoDB validation errors
        if (error?.name === "ValidationError") {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).send({
                error: "Invalid data provided.",
            });
            return;
        }
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).send({
            error: "Failed to add/update the tool.",
        });
        return;
    }
});
