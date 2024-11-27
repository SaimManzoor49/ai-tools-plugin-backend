import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import AiTool from "../models/aiTools.model";


// Controller to get all AI tools and their prompts
export const GetAiTools = asyncHandler(async (req, res) => {
  try {
    // Fetch all tools from MongoDB
    const tools = await AiTool.find();

    if (tools.length === 0) {
       res.status(StatusCodes.OK).send({
        message: "No AI tools found.",
        tools: [],
      });
      return
    }

    // Return the tools as JSON
    res.status(StatusCodes.OK).send({
      message: "AI tools retrieved successfully.",
      tools,
    });
  } catch (error:any) {
    console.error("Error retrieving AI tools:", error.message);
     res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: "Failed to retrieve AI tools.",
    });
    return
  }
});
