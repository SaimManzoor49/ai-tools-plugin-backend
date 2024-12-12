import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import AiTool from "../models/aiTools.model";
import OpenAI from "openai";
import { getApiKeyBySiteUrl } from "../utils/getApiKey";
import {GPT_MODAL_NAME} from '../constants/index';

// Handler to process text using the selected AI tool with streaming
export const AiHomeWorkHelper = asyncHandler(async (req: Request, res: Response) => {
  const { subject, academicLevel,topicOrQuestion, name, siteUrl } = req.body;

  // Validate input
  if (!name || name.trim().length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Tool name is required." });
    return;
  }


  if (siteUrl?.trim()?.length < 4) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Site URL is required." });
    return;
  }
  if (!subject?.trim().length) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide the subject." });
    return;
  }
  if (!academicLevel?.trim().length) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify you academic level." });
    return;
  }
  if (!topicOrQuestion?.trim().length) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide you topic or questions." });
    return;
  }

  try {
    // Query MongoDB to find the AI tool by name
    const tool = await AiTool.findOne({ name });

    if (!tool) {
      res.status(StatusCodes.NOT_FOUND).json({ error: `Tool with name "${name}" not found.` });
      return;
    }

    let prompt = tool.prompt; // Extract the prompt from the database

    const dynamicVariables = {
      subject, academicLevel,topicOrQuestion
    };

    // Replace all variables dynamically
    for (let [key, value] of Object.entries(dynamicVariables)) {
      const regex = new RegExp(`\\\${${key}}`, 'g');  
      prompt = prompt.replace(regex, value);
    }

    const apiKey = await getApiKeyBySiteUrl(siteUrl);
    const openai = new OpenAI({ apiKey: apiKey });

    // Set headers for a streamed response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: GPT_MODAL_NAME,
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: topicOrQuestion,
        },
      ],
      stream: true,
    });
    // Stream response data to the client
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`${content}`); // Write data to the response
      }
    }

    // End the stream
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Error processing AI Discussion Response Generator request:", error);
    res.status(500).json({ error: error?.message || "Failed to process the request with OpenAI." });
  }
});
