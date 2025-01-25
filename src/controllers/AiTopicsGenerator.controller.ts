import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import AiTool from "../models/aiTools.model";
import OpenAI from "openai";
import { getApiKeyBySiteUrl } from "../utils/getApiKey";

// Handler to process text using the selected AI tool with streaming
export const AiTopicsGenerator = asyncHandler(async (req: Request, res: Response) => {
  const { topic, subject,targetAudience,keywords, name, siteUrl } = req.body;

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
  if (!topic?.trim().length) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide the topic." });
    return;
  }
  if (!targetAudience?.trim().length) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify the target audience." });
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
      topic, subject,targetAudience,keywords,
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
      model: tool?.modelName,
      messages: [
        {
          role: "system",
          content: `You are an expert topic generator and writer assistant. Your job is to suggest engaging and relevant topics based on the user's inputs, such as type, subject/field of study, target audience, and keywords or interests. Ensure the topics are clear, creative, and tailored to the specified audience and purpose. Always respond only in JSON format with an array of generated topic suggestions. Do not include any additional text, explanations, or comments outside the JSON structure.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format:{ "type": "json_object" },
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
