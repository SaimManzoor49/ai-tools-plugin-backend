"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const aiToolSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    prompt: { type: String, required: true },
    modelName: { type: String, required: true, default: 'gpt-4o-mini' }
}, { timestamps: true });
const AiTool = mongoose_1.default.model("AiTool", aiToolSchema);
exports.default = AiTool;
