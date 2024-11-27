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

// Initialize SQLite Databasex
const dbPath = path.resolve(__dirname, "./data/database.db");
const db = new sqlite3.Database(dbPath);

// Extend the global type to include `openai`
declare global {
  namespace NodeJS {
    interface Global {
      openai: OpenAI;
    }
  }
}

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
    const apiKey = await getApiKey(); // Retrieve API key from the database
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
