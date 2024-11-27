import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import sqlite3 from "sqlite3";
import path from "path";

export const AddToolToDb = asyncHandler(async (req, res) => {
  const dbPath = path.join('/tmp', 'database.db');
  
  const db = new sqlite3.Database(dbPath, (err) => {
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

    const { name, prompt } = req.body; // Get the tool name and prompt from the request body

    if (!name || !prompt) {
      return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Tool name and prompt are required.' });
    }

    // Check if the tool already exists
    const checkToolExistsSQL = `
      SELECT id FROM ai_tools WHERE name = ?;
    `;

    db.get(checkToolExistsSQL, [name], function (err, row) {
      if (err) {
        console.error('Error checking tool existence:', err.message);
        return res.status(500).send({ error: 'Error checking if tool exists.' });
      }

      if (row) {
        // Tool already exists, update the prompt
        const updateToolSQL = `
          UPDATE ai_tools
          SET prompt = ?, updated_at = CURRENT_TIMESTAMP
          WHERE name = ?;
        `;
        
        db.run(updateToolSQL, [prompt, name], function (err) {
          if (err) {
            console.error('Error updating tool:', err.message);
            return res.status(500).send({ error: 'Failed to update tool in the database.' });
          }

          console.log('Tool updated successfully');
          res.status(StatusCodes.OK).send({
            message: 'Tool prompt updated successfully.',
            toolName: name, // Return the updated tool's name
          });
        });
      } else {
        // Tool does not exist, insert a new tool
        const insertToolSQL = `
          INSERT INTO ai_tools (name, prompt) 
          VALUES (?, ?);
        `;
        
        db.run(insertToolSQL, [name, prompt], function (err) {
          if (err) {
            console.error('Error inserting tool:', err.message);
            return res.status(500).send({ error: 'Failed to insert tool into the database.' });
          }

          console.log('New AI Tool inserted with ID:', this.lastID);
          res.status(StatusCodes.CREATED).send({
            message: 'New tool added successfully.',
            toolId: this.lastID, // Return the ID of the newly inserted tool
          });
        });
      }
    });
  });

  // Close the database connection after the operation is completed
  db.close((err) => {
    if (err) {
      console.error('Error closing the database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
});
