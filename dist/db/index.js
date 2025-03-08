"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("../constants/index");
const connectToDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(`mongodb+srv://saimmanzoor:Password@cluster0.tkv8u4s.mongodb.net/aitools`);
        console.log(`\n MongoDB connected to Host: ${conn.connection.host}`);
    }
    catch (error) {
        console.log("\n MONGODB connection error ", error);
        process.exit(1);
    }
};
exports.default = connectToDB;
