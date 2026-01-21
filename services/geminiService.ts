import { GoogleGenAI } from "@google/genai";

export const analyzeJunkImage = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API Key not found, skipping AI analysis");
      return "AI analysis unavailable (Missing API Key).";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-2.5-flash-image for fast image analysis
    const model = 'gemini-2.5-flash-image';

    const prompt = `
      You are an expert junk removal estimator. Analyze this image of junk/debris.
      1. List the 3-5 main categories of items seen (e.g., old furniture, construction debris, yard waste).
      2. Estimate the volume relative to a standard pickup truck bed (e.g., 1/4 truck, 1/2 truck, full truck, or multiple trucks).
      3. Flag any potentially hazardous materials if visible (e.g., paint, batteries).
      
      Keep the response concise and friendly, addressed to the customer.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    return response.text || "Could not analyze the image.";

  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Sorry, we couldn't analyze the image automatically. Our team will review it manually.";
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};