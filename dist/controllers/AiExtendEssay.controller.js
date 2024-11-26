"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiExtendEssay = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.AiExtendEssay = (0, express_async_handler_1.default)(async (req, res) => {
    console.log('got request');
    res.status(200).json({ message: "Extend" });
});
