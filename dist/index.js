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
const index_1 = __importDefault(require("./db/index")); // Ensure this properly connects to MongoDB
const apiKey_model_1 = __importDefault(require("./models/apiKey.model"));
// Load environment variables
(0, dotenv_1.config)();
// Initialize the Express app
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Initialize the database
const initializeDb = async () => {
    try {
        const existingKey = await apiKey_model_1.default.findOne();
        if (!existingKey) {
            // Insert a temporary key if none exists
            const tempApiKey = "your_temp_api_key_here"; // Replace with a default or environment-based key
            await apiKey_model_1.default.create({ apiKey: tempApiKey });
            console.log("Inserted temporary API key.");
        }
        else {
            console.log("API key found.");
        }
    }
    catch (error) {
        throw new Error("Error initializing the database: " + error?.message);
    }
};
// Fetch the API key from the database
const getApiKey = async () => {
    try {
        const keyDoc = await apiKey_model_1.default.findOne();
        return keyDoc ? keyDoc.apiKey : null;
    }
    catch (error) {
        throw new Error("Error fetching the API key: " + error?.message);
    }
};
// Routes
app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello World!" });
});
app.use('/api/v1', tools_routes_1.default);
// Start the server
(async () => {
    try {
        // Connect to MongoDB
        await (0, index_1.default)();
        console.log("Connected to MongoDB.");
        // Initialize DB and ensure the API key exists
        await initializeDb();
        // Fetch the API key from MongoDB
        const apiKey = await getApiKey();
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
        console.error("Error initializing the server:", error);
        process.exit(1); // Exit the process in case of error
    }
    // Handle app-level errors
    app.on("error", (error) => {
        console.error("App error:", error?.message || "Unknown error");
    });
})();
