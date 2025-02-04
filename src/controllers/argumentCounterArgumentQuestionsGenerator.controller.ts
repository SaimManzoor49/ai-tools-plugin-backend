import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import AiTool from "../models/aiTools.model";
import OpenAI from "openai";
import { getApiKeyBySiteUrl } from "../utils/getApiKey";

// Handler to process text using the selected AI tool with streaming
export const AiArgumentCounterArgumentQuestionsGenerator = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      selectedType,               // "Argument" or "Counterargument"
      mainClaim,                  // Only for Argument
      audience,                   // Only for Argument
      evidence,                   // Optional for Argument
      argument,                   // Only for Counterargument
      provideEvidence,            // Only for Counterargument ("Yes" or "No")
      additionalContextCounter,   // Only for Counterargument (optional)
      tone,                       // Tone for both types
      additionalContext = 'no additional instructions', // For Argument (optional)
      name,
      siteUrl
    } = req.body;

    // Basic validations for common fields
    if (!name || name.trim().length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Tool name is required." });
      return;
    }
    if (!siteUrl || siteUrl.trim().length < 4) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Site URL is required." });
      return;
    }
    if (!selectedType || !selectedType.trim().length) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify the selected type (Argument or Counterargument)." });
      return;
    }
    if (!tone || !tone.trim().length) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify the tone." });
      return;
    }

    // Conditional validations based on selectedType
    if (selectedType === "Argument") {
      if (!mainClaim || !mainClaim.trim().length) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify the main claim or statement." });
        return;
      }
      if (!audience || !audience.trim().length) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify the target audience." });
        return;
      }
      // 'evidence' is optional. If not provided, the prompt instructs the tool to generate examples.
    } else if (selectedType === "Counterargument") {
      if (!argument || !argument.trim().length) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify the argument to respond to." });
        return;
      }
      if (!provideEvidence || !provideEvidence.trim().length) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Please specify whether to provide evidence/examples (Yes or No)." });
        return;
      }
      // additionalContextCounter is optional.
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid selected type. Must be 'Argument' or 'Counterargument'." });
      return;
    }

    try {
      // Query MongoDB to find the AI tool by name
      const tool = await AiTool.findOne({ name });
      if (!tool) {
        res.status(StatusCodes.NOT_FOUND).json({ error: `Tool with name "${name}" not found.` });
        return;
      }

      // Retrieve the prompt template stored in the database.
      // The template should include placeholders like ${selectedType}, ${mainClaim}, ${audience},
      // ${evidence}, ${argument}, ${provideEvidence}, ${additionalContextCounter}, ${tone}, and ${additionalContext}
      let prompt = tool.prompt;


      // Prepare dynamic variables for both cases.
      // For any fields not applicable to a given type, the value can be an empty string.
      const dynamicVariables: { [key: string]: string } = {
        selectedType,
        mainClaim: mainClaim || "",
        audience: audience || "",
        evidence: evidence || "",
        argument: argument || "",
        provideEvidence: provideEvidence || "",
        additionalContextCounter: additionalContextCounter || "",
        tone,
        additionalContext
      };

      // Replace each placeholder with its corresponding value
      for (let [key, value] of Object.entries(dynamicVariables)) {
        const regex = new RegExp(`\\\${${key}}`, "g");
        prompt = prompt.replace(regex, value);
      }


      // Retrieve API key based on siteUrl
      const apiKey = await getApiKeyBySiteUrl(siteUrl);
      const openai = new OpenAI({ apiKey });

      // Set headers for a streamed response
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Create a streaming completion using the unified prompt
      const stream = await openai.chat.completions.create({
        model: tool.modelName,
        messages: [
          {
            role: "system",
            content: `You are a creative and analytical writing assistant.`,
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
          res.write(`${content}`);
        }
      }

      // Signal the end of the stream
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error?.message || "Failed to process the request with OpenAI." });
    }
  }
);
