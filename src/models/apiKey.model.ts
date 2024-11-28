import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema({
    siteUrl: { type: String, required: true ,unique: true},
    apiKey: { type: String, required: true },
  }, { timestamps: true });
  
  const ApiKey = mongoose.model("ApiKey", apiKeySchema) 
 export default ApiKey ; 