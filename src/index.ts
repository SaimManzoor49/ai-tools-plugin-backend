import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import aiToolsRouter from './routes/tools.routes';
import OpenAI from "openai";
import connectToDB from './db/index'; // Ensure this properly connects to MongoDB
import ApiKey from "./models/apiKey.model";

// Load environment variables
config();

// Initialize the Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());



// Initialize the database
const initializeDb = async (): Promise<void> => {
  try {
    const existingKey = await ApiKey.findOne();
    if (!existingKey) {
      // Insert a temporary key if none exists
      const tempApiKey = "your_temp_api_key_here"; // Replace with a default or environment-based key
      await ApiKey.create({ apiKey: tempApiKey });
      console.log("Inserted temporary API key.");
    } else {
      console.log("API key found.");
    }
  } catch (error:any) {
    throw new Error("Error initializing the database: " + error?.message);
  }
};

// Fetch the API key from the database
const getApiKey = async (): Promise<string | null> => {
  try {
    const keyDoc = await ApiKey.findOne();
    return keyDoc ? keyDoc.apiKey : null;
  } catch (error:any) {
    throw new Error("Error fetching the API key: " + error?.message);
  }
};

// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello World!" });
});
app.use('/api/v1', aiToolsRouter);

// Start the server
(async () => {
  try {
    // Connect to MongoDB
    await connectToDB();
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
    const openai = new OpenAI({ apiKey });

    // Type assertion for global object
    (global as any).openai = openai; // Use `any` to avoid TypeScript conflicts

    // Start the server
    app.listen(process.env.PORT || 8081, () => {
      console.log("App is listening on: " + (process.env.PORT || 8081));
    });
  } catch (error:any) {
    console.error("Error initializing the server:", error);
    process.exit(1); // Exit the process in case of error
  }

  // Handle app-level errors
  app.on("error", (error: any) => {
    console.error("App error:", error?.message || "Unknown error");
  });
})();
