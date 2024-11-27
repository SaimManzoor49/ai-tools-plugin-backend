import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import sqlite3 from "sqlite3";
import path from "path";

// Controller to get all AI tools and their prompts
export const GetAiTools = asyncHandler(async (req, res) => {
  const dbPath = path.join('/tmp', 'database.db');
  
  const db = new sqlite3.Database(dbPath, (err) => {
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
      return res.status(StatusCodes.OK).send({
        message: 'No AI tools found.',
        tools: [],
      });
    }

    // Return the tools as JSON
    res.status(StatusCodes.OK).send({
      message: 'AI tools retrieved successfully.',
      tools: rows, // This contains all the tools with their name and prompt
    });
  });

  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing the database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
});
