"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const BannerSchema = new mongoose_1.default.Schema({
    bannerUrl: { type: String, required: true },
}, { timestamps: true });
const Banner = mongoose_1.default.model("Banner", BannerSchema);
exports.default = Banner;
