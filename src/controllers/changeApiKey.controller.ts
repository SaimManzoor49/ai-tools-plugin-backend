import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import fs from "fs";
import path from "path";

export const changeApiKey = asyncHandler(async (req: Request, res: Response) => {
    const { apiKey } = req.body;

    // Validate the API key
    if (!apiKey?.trim() || apiKey.trim().length < 8) {
         res.status(400).json({ response: "Please provide a valid key." });
         return
    }

    try {
        // Path to the key.ts file
        const filePath = path.resolve(__dirname, "../data/key.ts");

        // Generate the new content for the key.ts file
        const updatedContent = `export default { apiKey: "${apiKey}" };`;

        // Write the updated content back to the key.ts file
        fs.writeFileSync(filePath, updatedContent, "utf-8");

        res.status(200).json({ response: "Key updated successfully." });
    } catch (error) {
        console.error("Error updating key:", error);
        res.status(500).json({ response: "Failed to update the key." });
    }
});
