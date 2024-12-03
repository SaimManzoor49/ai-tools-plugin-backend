import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import Banner from "../models/banner.model";


// Controller to get all AI tools and their prompts
export const SetBannerUrl = asyncHandler(async (req, res) => {
  try {
    const { bannerUrl } = req.body;
    if (!bannerUrl?.length) {

      res.status(StatusCodes.BAD_REQUEST).send({
        message: "banner url is required",
      });
    }
    const oldBanner = await Banner.find()
    if (oldBanner?.length){
      await Banner.findOneAndUpdate({ bannerUrl: oldBanner[0].bannerUrl }, { bannerUrl: bannerUrl });
    }else{
      await Banner.create({ bannerUrl: bannerUrl });
    }


    // Return the tools as JSON
    res.status(StatusCodes.OK).send({
      message: "Banner url updated successfully.",
    });
  } catch (error: any) {
    console.error("Error updating Banner data:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: "Failed to updating Banner data.",
    });
    return
  }
});
