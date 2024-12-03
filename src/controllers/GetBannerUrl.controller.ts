import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import Banner from "../models/banner.model";


// Controller to get all AI tools and their prompts
export const GetBannerUrl = asyncHandler(async (req, res) => {
  try {
    // Fetch all tools from MongoDB
    const banner = await Banner.find();

    if (banner.length === 0) {
       res.status(StatusCodes.OK).send({
        message: "No Banner found.",
      });
      return
    }

    // Return the tools as JSON
    res.status(StatusCodes.OK).send({
      message: "Banner retrieved successfully.",
      bannerUrl:banner[0].bannerUrl,
    });
  } catch (error:any) {
    console.error("Error retrieving Banner data:", error.message);
     res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: "Failed to retrieve Banner data.",
    });
    return
  }
});
