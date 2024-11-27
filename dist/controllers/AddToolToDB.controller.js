"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddToolToDb = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
exports.AddToolToDb = (0, express_async_handler_1.default)(async (req, res) => {
    const dbPath = path_1.default.join('/tmp', 'database.db');
    const db = new sqlite3_1.default.Database(dbPath, (err) => {
        if (err) {
            console.error('Error connecting to the database:', err.message);
            return res.status(500).send({ error: 'Failed to connect to the database.' });
        }
        console.log('Connected to the SQLite database.');
    });
    // SQL to create the table if it does not exist
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ai_tools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      prompt TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
    // Run the create table query
    db.run(createTableSQL, function (err) {
        if (err) {
            console.error('Error creating table:', err.message);
            return res.status(500).send({ error: 'Error creating AI Tools table.' });
        }
        console.log('AI Tools table created (or already exists).');
        // After the table is created or already exists, insert the new tool
        const { name, prompt } = req.body; // Get the tool name and prompt from the request body
        if (!name || !prompt) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).send({ error: 'Tool name and prompt are required.' });
        }
        const insertToolSQL = `
      INSERT INTO ai_tools (name, prompt) 
      VALUES (?, ?);
    `;
        // Insert the new tool into the table
        db.run(insertToolSQL, [name, prompt], function (err) {
            if (err) {
                console.error('Error inserting tool:', err.message);
                return res.status(500).send({ error: 'Failed to insert tool into the database.' });
            }
            console.log('New AI Tool inserted with ID:', this.lastID);
            res.status(http_status_codes_1.StatusCodes.CREATED).send({
                message: 'New tool added successfully.',
                toolId: this.lastID, // Return the ID of the newly inserted tool
            });
        });
    });
    // Close the database connection after the operation is completed
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        }
        else {
            console.log('Database connection closed.');
        }
    });
});
