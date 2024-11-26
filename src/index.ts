import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import aiToolsRouter from './routes/tools.routes'
config();

const app = express();

/////////////////// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());


/////////////////////routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello World!" });
});
app.use('/api/v1',aiToolsRouter);


//////////////////// APP & DB
(() => {
    app.listen(process.env.PORT || 8081, () => {
      console.log("app is listning on : " + (process.env.PORT || 8081));
    });
    app.on("error", () => {
      console.log("Failed to connect app with DB");
    });
  }
)()
