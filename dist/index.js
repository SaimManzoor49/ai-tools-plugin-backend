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
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
// Load environment variables
(0, dotenv_1.config)();
// Initialize the Express app
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Initialize SQLite Databasex
const dbPath = path_1.default.resolve(__dirname, "./data/database.db");
const db = new sqlite3_1.default.Database(dbPath);
// Fetch API key from the database
const getApiKey = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT apiKey FROM api_keys WHERE id = 1", (err, row) => {
            if (err) {
                reject("Database error: " + err.message);
            }
            else if (row && row.apiKey) {
                resolve(row.apiKey);
            }
            else {
                resolve(null); // No key found
            }
        });
    });
};
// Routes
app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello World!" });
});
app.use('/api/v1', tools_routes_1.default);
// Start the server
(async () => {
    try {
        const apiKey = await getApiKey(); // Retrieve API key from the database
        if (!apiKey) {
            console.error("API key not found in the database");
            process.exit(1); // Exit the process if API key is not found
        }
        // Initialize OpenAI with the retrieved API key
        const openai = new openai_1.default({ apiKey });
        // Type assertion for global object
        global.openai = openai; // Use `any` to avoid TypeScript conflicts
        // Start the server
        app.listen(process.env.PORT || 8081, () => {
            console.log("App is listening on: " + (process.env.PORT || 8081));
        });
    }
    catch (error) {
        console.error("Error initializing OpenAI:", error);
        process.exit(1); // Exit the process in case of error
    }
    // Handle app-level errors
    app.on("error", (error) => {
        console.error("App error:", error.message || "Unknown error");
    });
})();
