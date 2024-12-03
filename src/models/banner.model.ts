import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema({
    bannerUrl: { type: String, required: true },
  }, { timestamps: true });
  
  const Banner = mongoose.model("Banner", BannerSchema);

  export default Banner