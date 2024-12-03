"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetBannerUrl = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const banner_model_1 = __importDefault(require("../models/banner.model"));
// Controller to get all AI tools and their prompts
exports.SetBannerUrl = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { bannerUrl } = req.body;
        if (!bannerUrl?.length) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).send({
                message: "banner url is required",
            });
        }
        const oldBanner = await banner_model_1.default.find();
        if (oldBanner?.length) {
            await banner_model_1.default.findOneAndUpdate({ bannerUrl: oldBanner[0].bannerUrl }, { bannerUrl: bannerUrl });
        }
        else {
            await banner_model_1.default.create({ bannerUrl: bannerUrl });
        }
        // Return the tools as JSON
        res.status(http_status_codes_1.StatusCodes.OK).send({
            message: "Banner url updated successfully.",
        });
    }
    catch (error) {
        console.error("Error updating Banner data:", error.message);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).send({
            error: "Failed to updating Banner data.",
        });
        return;
    }
});
