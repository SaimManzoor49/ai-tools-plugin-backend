"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBannerUrl = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const banner_model_1 = __importDefault(require("../models/banner.model"));
// Controller to get all AI tools and their prompts
exports.GetBannerUrl = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Fetch all tools from MongoDB
        const banner = await banner_model_1.default.find();
        if (banner.length === 0) {
            res.status(http_status_codes_1.StatusCodes.OK).send({
                message: "No Banner found.",
            });
            return;
        }
        // Return the tools as JSON
        res.status(http_status_codes_1.StatusCodes.OK).send({
            message: "Banner retrieved successfully.",
            bannerUrl: banner[0].bannerUrl,
        });
    }
    catch (error) {
        console.error("Error retrieving Banner data:", error.message);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).send({
            error: "Failed to retrieve Banner data.",
        });
        return;
    }
});
