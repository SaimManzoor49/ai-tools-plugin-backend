"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAiTools = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
// Controller to get all AI tools and their prompts
exports.GetAiTools = (0, express_async_handler_1.default)(async (req, res) => {
    const dbPath = path_1.default.join('/tmp', 'database.db');
    const db = new sqlite3_1.default.Database(dbPath, (err) => {
        if (err) {
            console.error('Error connecting to the database:', err.message);
            return res.status(500).send({ error: 'Failed to connect to the database.' });
        }
        console.log('Connected to the SQLite database.');
    });
    // SQL query to get all tools and their prompts
    const getToolsSQL = `
    SELECT id, name, prompt FROM ai_tools;
  `;
    // Run the SQL query to fetch all tools
    db.all(getToolsSQL, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving tools:', err.message);
            return res.status(500).send({ error: 'Failed to retrieve AI tools.' });
        }
        // If there are no tools, return an empty array
        if (rows.length === 0) {
            return res.status(http_status_codes_1.StatusCodes.OK).send({
                message: 'No AI tools found.',
                tools: [],
            });
        }
        // Return the tools as JSON
        res.status(http_status_codes_1.StatusCodes.OK).send({
            message: 'AI tools retrieved successfully.',
            tools: rows, // This contains all the tools with their name and prompt
        });
    });
    // Close the database connection
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        }
        else {
            console.log('Database connection closed.');
        }
    });
});
