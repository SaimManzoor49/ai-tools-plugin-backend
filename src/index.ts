import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import aiToolsRouter from './routes/tools.routes';
import OpenAI from "openai";
import sqlite3 from "sqlite3";
import path from "path";

// Load environment variables
config();

// Initialize the Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Use /tmp for database (for Vercel or similar environments)
const dbPath = path.join('/tmp', 'database.db'); // Using path.join to ensure proper path construction
console.log('Database path:', dbPath);

// Create and connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create table for storing API key (if not exists) and insert a default API key if needed
const initializeDb = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Create table if not exists
    db.serialize(() => {
      db.run("CREATE TABLE IF NOT EXISTS api_keys (id INTEGER PRIMARY KEY AUTOINCREMENT, apiKey TEXT)", (err) => {
        if (err) {
          return reject("Error creating table: " + err.message);
        }

        // Check if an API key exists
        db.get("SELECT apiKey FROM api_keys WHERE id = 1", (err, row:any) => {
          if (err) {
            return reject("Database error: " + err.message);
          }

          if (!row || !row.apiKey) {
            // If no key is found, insert a temporary key
            const tempApiKey = "your_temp_api_key_here"; // You can replace this with any key you want
            db.run("INSERT INTO api_keys (apiKey) VALUES (?)", [tempApiKey], (err) => {
              if (err) {
                return reject("Error inserting temporary API key: " + err.message);
              }
              console.log("Inserted temporary API key.");
              resolve(); // Proceed after inserting the key
            });
          } else {
            console.log("API key found.");
            resolve(); // Proceed if API key exists
          }
        });
      });
    });
  });
};

// Fetch API key from the database
const getApiKey = (): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    db.get("SELECT apiKey FROM api_keys WHERE id = 1", (err, row:any) => {
      if (err) {
        reject("Database error: " + err.message);
      } else if (row && row.apiKey) {
        resolve(row.apiKey);
      } else {
        resolve(null); // No key found
      }
    });
  });
};

// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello World!" });
});
app.use('/api/v1', aiToolsRouter);

// Start the server
(async () => {
  try {
    // Initialize DB and ensure the API key exists
    await initializeDb();

    // Fetch the API key from the database
    const apiKey = await getApiKey(); 
    if (!apiKey) {
      console.error("API key not found in the database");
      process.exit(1); // Exit the process if API key is not found
    }

    // Initialize OpenAI with the retrieved API key
    const openai = new OpenAI({ apiKey });

    // Type assertion for global object
    (global as any).openai = openai; // Use `any` to avoid TypeScript conflicts

    // Start the server
    app.listen(process.env.PORT || 8081, () => {
      console.log("App is listening on: " + (process.env.PORT || 8081));
    });
  } catch (error) {
    console.error("Error initializing OpenAI:", error);
    process.exit(1); // Exit the process in case of error
  }

  // Handle app-level errors
  app.on("error", (error: any) => {
    console.error("App error:", error.message || "Unknown error");
  });
})();
