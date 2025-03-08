"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("../constants/index");
const connectToDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(
            `mongodb://saimmanzoor:Password@ac-qxhhdng-shard-00-00.tkv8u4s.mongodb.net:27017,ac-qxhhdng-shard-00-01.tkv8u4s.mongodb.net:27017,ac-qxhhdng-shard-00-02.tkv8u4s.mongodb.net:27017/aitools?ssl=true&replicaSet=atlas-q74vx9-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`,
            { useNewUrlParser: true, useUnifiedTopology: true }
        );
        console.log(`\n MongoDB connected to Host: ${conn.connection.host}`);
    }
    catch (error) {
        console.log("\n MONGODB connection error ", error);
        process.exit(1);
    }
};
exports.default = connectToDB;
