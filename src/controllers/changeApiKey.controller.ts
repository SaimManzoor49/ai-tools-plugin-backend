import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sqlite3 from "sqlite3";
import path from "path";
import { OpenAI } from "openai";  // Import OpenAI client

// Initialize SQLite Database
const dbPath = path.resolve(__dirname, "../data/database.db");
const db = new sqlite3.Database(dbPath);

// Create table for storing API key (if not exists)
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS api_keys (id INTEGER PRIMARY KEY AUTOINCREMENT, apiKey TEXT)");
});

// Change API key handler
export const changeApiKey = asyncHandler(async (req: Request, res: Response) => {
    const { apiKey } = req.body;

    // Validate the API key
    if (!apiKey?.trim() || apiKey.trim().length < 8) {
         res.status(400).json({ response: "Please provide a valid key." });
         return
    }

    try {
        // Check if there's already a key in the database
        db.get("SELECT apiKey FROM api_keys WHERE id = 1", (err, row) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ response: "Database error." });
            }

            // If key exists, update it, else insert the new key
            if (row) {
                // Update existing key
                db.run("UPDATE api_keys SET apiKey = ? WHERE id = 1", [apiKey], (updateErr) => {
                    if (updateErr) {
                        console.error("Error updating API key:", updateErr);
                        return res.status(500).json({ response: "Failed to update the key." });
                    }

                    // Re-initialize the OpenAI client with the new key
                    reinitializeOpenAI(apiKey);

                    return res.status(200).json({ response: "Key updated successfully." });
                });
            } else {
                // Insert new key if none exists
                db.run("INSERT INTO api_keys (apiKey) VALUES (?)", [apiKey], (insertErr) => {
                    if (insertErr) {
                        console.error("Error inserting API key:", insertErr);
                        return res.status(500).json({ response: "Failed to save the key." });
                    }

                    // Re-initialize the OpenAI client with the new key
                    reinitializeOpenAI(apiKey);

                    return res.status(200).json({ response: "Key saved successfully." });
                });
            }
        });
    } catch (error) {
        console.error("Error updating key:", error);
        res.status(500).json({ response: "Failed to update the key." });
    }
});

// Function to reinitialize the OpenAI client
function reinitializeOpenAI(apiKey: string) {
    try {
        const openai = new OpenAI({
            apiKey: apiKey,
        });

        // Assign OpenAI client to global object
        (global as any).openai = openai; // Type assertion to avoid TypeScript issues

        console.log("OpenAI client reinitialized with new API key.");
    } catch (error) {
        console.error("Error initializing OpenAI client:", error);
    }
}
