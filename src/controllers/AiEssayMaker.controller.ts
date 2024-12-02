import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import AiTool from "../models/aiTools.model";
import OpenAI from "openai";
import { getApiKeyBySiteUrl } from "../utils/getApiKey";
import {GPT_MODAL_NAME} from '../constants/index';

// Handler to process text using the selected AI tool with streaming
export const AiEssayMaker = asyncHandler(async (req: Request, res: Response) => {
  const { essayTopic, wordCount, essayType, additionalInstructions = 'no additional instructions', name, siteUrl } = req.body;

  // Validate input
  if (!name || name.trim().length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Tool name is required." });
    return;
  }


  if (siteUrl?.trim()?.length < 4) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Site URL is required." });
    return;
  }

  if (!wordCount && wordCount <= 0) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify the word limit." });
    return;
  }
  if (!essayTopic?.trim().length) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify the topic for your essay." });
    return;
  }
  if (!essayType?.trim().length) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify the type for your essay." });
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
      essayTopic, essayType, wordCount, additionalInstructions
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
          content: `You are an advanced AI designed to write high-quality essays. Follow the user's instructions carefully to ensure the essay is well-structured, coherent, and aligned with the specified topic, type, and word count. If additional instructions are provided, such as tone, formatting, or specific points, incorporate them seamlessly into the essay. Always ensure the essay meets the requirements while maintaining clarity and relevance.`,
        },
        {
          role: "user",
          content: prompt,
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
    console.error("Error processing AI Research Paper Maker request:", error);
    res.status(500).json({ error: error?.message || "Failed to process the request with OpenAI." });
  }
});
