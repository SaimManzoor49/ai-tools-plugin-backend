import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import aiToolsRouter from './routes/tools.routes';
import connectToDB from './db/index'; // Ensure this properly connects to MongoDB

// Load environment variables
config();

// Initialize the Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());




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
