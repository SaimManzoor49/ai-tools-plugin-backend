import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import AiTool from "../models/aiTools.model";
import OpenAI from "openai";
import { getApiKeyBySiteUrl } from "../utils/getApiKey";


// Handler to process text using the selected AI tool
export const AiHumanizer = asyncHandler(async (req: Request, res: Response) => {
  const { text, tone, name,siteUrl } = req.body;

  // Validate input
  if (!name || name.trim().length === 0) {
     res.status(StatusCodes.BAD_REQUEST).json({ error: "Tool name is required." });
     return
  }

  if (text?.trim()?.length < 8) {
     res.status(StatusCodes.BAD_REQUEST).json({ error: "Input text is too short or incorrect." });
     return
  }

  if (siteUrl?.trim()?.length < 4) {
     res.status(StatusCodes.BAD_REQUEST).json({ error: "Site URL is required." });
     return
  }
console.log(siteUrl)
  try {
    // Query MongoDB to find the AI tool by name
    const tool = await AiTool.findOne({ name });

    if (!tool) {
       res.status(StatusCodes.NOT_FOUND).json({ error: `Tool with name "${name}" not found.` });
       return
    }

    let prompt = tool.prompt;  // Extract the prompt from the database

    // Inject the tone into the prompt
    prompt = prompt.replace('${tone}', tone);
    const apiKey =await getApiKeyBySiteUrl(siteUrl)
    const openai = new OpenAI({apiKey:apiKey})
    // Use OpenAI with the retrieved prompt
    const completion = await openai.chat.completions.create({
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
     return
  } catch (error) {
    console.error("Error processing AI humanizer request:", error);
     res.status(500).json({ error: "Failed to process the request with OpenAI." });
     return
  }
});
