import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import AiTool from "../models/aiTools.model";
import OpenAI from "openai";
import { getApiKeyBySiteUrl } from "../utils/getApiKey";
import {GPT_MODAL_NAME} from '../constants/index';

// Handler to process text using the selected AI tool with streaming
export const AiResearchPaperMaker = asyncHandler(async (req: Request, res: Response) => {
  const { researchPaperTopic, wordCountLimit, citationStyle, additionalInstructions = 'no additional instructions', name, siteUrl } = req.body;

  // Validate input
  if (!name || name.trim().length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Tool name is required." });
    return;
  }


  if (siteUrl?.trim()?.length < 4) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Site URL is required." });
    return;
  }

  if (!wordCountLimit && wordCountLimit <= 0) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify the word limit." });
    return;
  }
  if (!researchPaperTopic?.trim().length) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify the topic for your research paper." });
    return;
  }
  if (!citationStyle?.trim().length) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify the citation style to follow." });
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
      researchPaperTopic, wordCountLimit, citationStyle, additionalInstructions
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
          content: `You are an advanced AI designed to assist with generating high-quality research papers. Follow the user's instructions carefully and ensure the content is well-organized, coherent, and relevant to the specified topic. Apply the appropriate citation style and ensure that the paper meets the word count limit. If any additional instructions are provided, incorporate them seamlessly into the paper.`,
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
