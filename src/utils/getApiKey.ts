import ApiKey from "../models/apiKey.model";

export const getApiKeyBySiteUrl = async (siteUrl:string) => {
  
    if (!siteUrl?.trim()) {
        throw new Error("Site URL is required")
    }
  
    try {
      // Retrieve the API key for the given siteUrl
      const keyData = await ApiKey.findOne({ siteUrl });
  
      if (!keyData) {
        throw new Error('No API key found')
      }
  
      return keyData.apiKey;
    } catch (error) {
      console.error("Error retrieving API key:", error);
      return null
    }
  };
  