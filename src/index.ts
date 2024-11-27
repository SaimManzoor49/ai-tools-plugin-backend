import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import aiToolsRouter from './routes/tools.routes';
import OpenAI from "openai";
import apiKey from './data/key'
// Load environment variables
config();

// Extend the global type to include `openai`
declare global {
  namespace NodeJS {
    interface Global {
      openai: OpenAI;
    }
  }
}

// Initialize the Express app
const app = express();

/////////////////// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

///////////////////// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello World!" });
});
app.use('/api/v1', aiToolsRouter);

//////////////////// APP & DB
(() => {
  // Start the server
  app.listen(process.env.PORT || 8081, () => {
    try {
      // Initialize OpenAI and assign it to global
      const openai = new OpenAI({ apiKey:apiKey.apiKey});

      // Type assertion for global object
      (global as any).openai = openai; // Use `any` to avoid TypeScript conflicts

      console.log("App is listening on: " + (process.env.PORT || 8081));
    } catch (error) {
      console.error("Error initializing OpenAI:", error);
    }
  });

  // Handle app-level errors
  app.on("error", (error: any) => {
    console.error("App error:", error.message || "Unknown error");
  });
})();
