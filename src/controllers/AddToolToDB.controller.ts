import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import AiTool from "../models/aiTools.model";


// Controller to add or update an AI tool
export const AddToolToDb = asyncHandler(async (req, res) => {
  const { name, prompt } = req.body;

  // Validate input
  if (!name || !prompt) {
     res.status(StatusCodes.BAD_REQUEST).send({
      error: "Tool name and prompt are required.",
    });
    return
  }

  try {
    // Check if the tool already exists
    const existingTool = await AiTool.findOne({ name });

    if (existingTool) {
      // If the tool exists, update its prompt
      existingTool.prompt = prompt;
      await existingTool.save();

       res.status(StatusCodes.OK).send({
        message: "Tool prompt updated successfully.",
        toolName: name,
      });
      return
    }

    // If the tool does not exist, create a new one
    const newTool = new AiTool({ name, prompt });
    await newTool.save();

    res.status(StatusCodes.CREATED).send({
      message: "New tool added successfully.",
      toolId: newTool._id,
    });
  } catch (error:any) {
    console.error("Error adding/updating AI tool:", error?.message);

    // Handle MongoDB validation errors
    if (error?.name === "ValidationError") {
       res.status(StatusCodes.BAD_REQUEST).send({
        error: "Invalid data provided.",
      });
      return
    }

     res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: "Failed to add/update the tool.",
    });
    return
  }
});
export const updateToolModel = asyncHandler(async (req, res) => {
  const { name, modelName } = req.body;

  // Validate input
  if (!name || !modelName) {
     res.status(StatusCodes.BAD_REQUEST).send({
      error: "Tool name and Model Name are required.",
    });
    return
  }

  try {
    // Check if the tool already exists
    const existingTool = await AiTool.findOne({ name });

    if (existingTool) {
      // If the tool exists, update its prompt
      existingTool.modelName = modelName;
      await existingTool.save();

       res.status(StatusCodes.OK).send({
        message: "Tool Model Name updated successfully.",
        toolName: name,
      });
      return
    }
  } catch (error:any) {
    console.error("Error adding/updating AI tool:", error?.message);

    // Handle MongoDB validation errors
    if (error?.name === "ValidationError") {
       res.status(StatusCodes.BAD_REQUEST).send({
        error: "Invalid data provided.",
      });
      return
    }

     res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: "Failed to add/update the tool.",
    });
    return
  }
});
