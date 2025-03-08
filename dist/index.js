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
const index_1 = __importDefault(require("./db/index")); // Ensure this properly connects to MongoDB
// Load environment variables
(0, dotenv_1.config)();
// Initialize the Express app
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
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
        // Start the server
        app.listen(process.env.PORT || 8081, () => {
            console.log("App is listening on: " + (process.env.PORT || 8080));
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
