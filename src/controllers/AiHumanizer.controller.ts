import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import sqlite3 from "sqlite3";
import path from "path";

export const AiHumanizer = asyncHandler(async (req: Request, res: Response) => {
  const { text, tone, name } = req.body;

  if (!name || name.trim().length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Tool name is required." });
      return
  }

  if (text?.trim()?.length < 8) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Input text is not correct or too short." });
      return
  }

  const dbPath = path.join('/tmp', 'database.db');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Error connecting to the database:", err.message);
      res.status(500).json({ error: "Failed to connect to the database." });
      return
    }
  });

  // Query to get the prompt for the provided tool name
  const getPromptSQL = `
    SELECT prompt FROM ai_tools WHERE name = ?;
  `;

  db.get(getPromptSQL, [name], async (err, row:any) => {
    if (err) {
      console.error("Error querying the database:", err.message);
      res.status(500).json({ error: "Failed to retrieve prompt from the database." });
      return
    }

    if (!row) {
        res.status(StatusCodes.NOT_FOUND).json({ error: `Tool with name "${name}" not found.` });
      return
    }

    let prompt = row.prompt; // Extract the prompt from the result

    try {
        const temp = prompt.split('${tone}');
        prompt = temp[0]+`${tone}`+temp[1];
      // Use global.openai with the retrieved prompt
      const completion = await (global as any).openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
      });

      res.status(200).json({ response: completion.choices[0].message.content });
    } catch (error) {
      console.error("Error generating OpenAI completion:", error);
      res.status(500).json({ error: "Failed to generate completion using OpenAI." });
    } finally {
      // Close the database connection
      db.close((err) => {
        if (err) {
          console.error("Error closing the database:", err.message);
        }
      });
    }
  });
});
