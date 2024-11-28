"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiKeyBySiteUrl = void 0;
const apiKey_model_1 = __importDefault(require("../models/apiKey.model"));
const getApiKeyBySiteUrl = async (siteUrl) => {
    if (!siteUrl?.trim()) {
        throw new Error("Site URL is required");
    }
    try {
        // Retrieve the API key for the given siteUrl
        const keyData = await apiKey_model_1.default.findOne({ siteUrl });
        if (!keyData) {
            throw new Error('No API key found');
        }
        return keyData.apiKey;
    }
    catch (error) {
        console.error("Error retrieving API key:", error);
        return null;
    }
};
exports.getApiKeyBySiteUrl = getApiKeyBySiteUrl;
