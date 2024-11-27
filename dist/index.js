"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = require("dotenv");
const tools_routes_1 = __importDefault(require("./routes/tools.routes"));
const openai_1 = __importDefault(require("openai"));
const key_1 = __importDefault(require("./data/key"));
// Load environment variables
(0, dotenv_1.config)();
// Initialize the Express app
const app = (0, express_1.default)();
/////////////////// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
///////////////////// Routes
app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello World!" });
});
app.use('/api/v1', tools_routes_1.default);
//////////////////// APP & DB
(() => {
    // Start the server
    app.listen(process.env.PORT || 8081, () => {
        try {
            // Initialize OpenAI and assign it to global
            const openai = new openai_1.default({ apiKey: key_1.default.apiKey });
            // Type assertion for global object
            global.openai = openai; // Use `any` to avoid TypeScript conflicts
            console.log("App is listening on: " + (process.env.PORT || 8081));
        }
        catch (error) {
            console.error("Error initializing OpenAI:", error);
        }
    });
    // Handle app-level errors
    app.on("error", (error) => {
        console.error("App error:", error.message || "Unknown error");
    });
})();
