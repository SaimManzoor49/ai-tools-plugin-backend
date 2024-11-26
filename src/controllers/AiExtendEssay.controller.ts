import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

export const AiExtendEssay = asyncHandler(async (req, res) => {
    console.log('got request')
res.status(200).json({ message: "Extend"})
});
