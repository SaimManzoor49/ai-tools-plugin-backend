"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeApiKey = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.changeApiKey = (0, express_async_handler_1.default)(async (req, res) => {
    const { apiKey } = req.body;
    // Validate the API key
    if (!apiKey?.trim() || apiKey.trim().length < 8) {
        res.status(400).json({ response: "Please provide a valid key." });
        return;
    }
    try {
        // Path to the key.ts file
        const filePath = path_1.default.resolve(__dirname, "../data/key.ts");
        // Generate the new content for the key.ts file
        const updatedContent = `export default { apiKey: "${apiKey}" };`;
        // Write the updated content back to the key.ts file
        fs_1.default.writeFileSync(filePath, updatedContent, "utf-8");
        res.status(200).json({ response: "Key updated successfully." });
    }
    catch (error) {
        console.error("Error updating key:", error);
        res.status(500).json({ response: "Failed to update the key." });
    }
});
