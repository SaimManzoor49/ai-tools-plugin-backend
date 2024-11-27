import mongoose from "mongoose";

const aiToolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    prompt: { type: String, required: true },
  }, { timestamps: true });
  
  const AiTool = mongoose.model("AiTool", aiToolSchema);

  export default AiTool