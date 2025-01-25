import mongoose from "mongoose";

const aiToolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    prompt: { type: String, required: true },
    modelName:{type: String, required: true,default:'gpt-4o-mini'}
  }, { timestamps: true });
  
  const AiTool = mongoose.model("AiTool", aiToolSchema);

  export default AiTool