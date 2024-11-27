import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { OpenAI } from "openai"; // Import OpenAI client
import ApiKey from "../models/apiKey.model";


// Handler to change the API key
export const changeApiKey = asyncHandler(async (req: Request, res: Response) => {
  const { apiKey } = req.body;

  // Validate the API key
  if (!apiKey?.trim() || apiKey.trim().length < 8) {
     res.status(400).json({ response: "Please provide a valid key." });
     return
  }

  try {
    // Check if an API key exists
    const existingKey = await ApiKey.findOne();

    if (existingKey) {
      // Update the existing API key
      existingKey.apiKey = apiKey;
      await existingKey.save();

      // Reinitialize OpenAI with the new key
      reinitializeOpenAI(apiKey);

       res.status(200).json({ response: "Key updated successfully." });
       return
    } else {
      // Insert a new API key
      const newKey = new ApiKey({ apiKey });
      await newKey.save();

      // Reinitialize OpenAI with the new key
      reinitializeOpenAI(apiKey);

       res.status(200).json({ response: "Key saved successfully." });
       return
    }
  } catch (error) {
    console.error("Error updating API key:", error);
    res.status(500).json({ response: "Failed to update the key." });
  }
});

// Handler to test the API key with OpenAI
export const testKey = asyncHandler(async (req: Request, res: Response) => {
  const { apiKey } = req.body;

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helper and only respond with 'ok'. No additional text is allowed.",
        },
        {
          role: "user",
          content: "test",
        },
      ],
    });

     res.status(200).json({ response: completion.choices[0].message.content });
     return
  } catch (error) {
    console.error("Error testing API key:", error);
     res.status(500).json({ response: "Failed to test the API key." });
     return
  }
});

// Function to reinitialize the OpenAI client
function reinitializeOpenAI(apiKey: string) {
  try {
    const openai = new OpenAI({ apiKey });

    // Assign OpenAI client to the global object
    (global as any).openai = openai;

    console.log("OpenAI client reinitialized with new API key.");
  } catch (error) {
    console.error("Error initializing OpenAI client:", error);
  }
}
