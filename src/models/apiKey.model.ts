import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema({
    apiKey: { type: String, required: true },
  }, { timestamps: true });
  
  const ApiKey = mongoose.model("ApiKey", apiKeySchema) 
 export default ApiKey ; 